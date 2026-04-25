package com.skyBooker.payment.service;

import org.json.JSONObject;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.skyBooker.payment.config.RazorpayProvider;
import com.skyBooker.payment.dto.RazorpayOrderRequest;
import com.skyBooker.payment.dto.RazorpayOrderResponse;
import com.skyBooker.payment.dto.PaymentVerificationRequest;
import com.skyBooker.payment.entity.Payment;
import com.skyBooker.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final RazorpayProvider razorpayProvider;

    @Value("${razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret}")
    private String razorpayKeySecret;

    @Value("${razorpay.webhook-secret:${razorpay.key-secret}}")
    private String razorpayWebhookSecret;

    @Value("${services.booking-base-url:http://booking-service}")
    private String bookingBaseUrl;

    @Override
    public RazorpayOrderResponse createRazorpayOrder(RazorpayOrderRequest request, String userEmail, String userName) {
        try {
            RazorpayClient client = razorpayProvider.getClient();
            String transactionId = generateTransactionId();

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", request.getAmount().multiply(BigDecimal.valueOf(100)).intValue());
            orderRequest.put("currency", request.getCurrency());
            orderRequest.put("receipt", transactionId);

            JSONObject notes = new JSONObject();
            notes.put("bookingId", request.getBookingId());
            notes.put("userId", request.getUserId());
            orderRequest.put("notes", notes);

            Order order = client.orders.create(orderRequest);

            Payment payment = new Payment();
            payment.setTransactionId(transactionId);
            payment.setBookingId(request.getBookingId());
            payment.setUserId(request.getUserId());
            payment.setAmount(request.getAmount());
            payment.setPaymentMethod(request.getPaymentMethod());
            payment.setStatus(Payment.PaymentStatus.PENDING);
            payment.setRazorpayOrderId(order.get("id"));
            paymentRepository.save(payment);

            return RazorpayOrderResponse.builder()
                    .orderId(order.get("id"))
                    .keyId(razorpayKeyId)
                    .amount(request.getAmount())
                    .currency(request.getCurrency())
                    .userId(request.getUserId())
                    .userEmail(userEmail)
                    .userName(userName)
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage());
        }
    }

    @Override
    public Payment verifyAndProcessPayment(PaymentVerificationRequest request) {
        try {
            String signatureBody = request.getOrderId() + "|" + request.getPaymentId();
            String expectedSignature = hmacSHA256(signatureBody, razorpayKeySecret);

            System.out.println("Verifying payment signature:");
            System.out.println("Order ID: " + request.getOrderId());
            System.out.println("Payment ID: " + request.getPaymentId());
            System.out.println("Received Signature: " + request.getSignature());
            System.out.println("Expected Signature: " + expectedSignature);
            System.out.println("Signature Body: " + signatureBody);

            if (!expectedSignature.equals(request.getSignature())) {
                throw new RuntimeException("Payment signature verification failed. Expected: " + expectedSignature + ", Received: " + request.getSignature());
            }

            Payment payment = paymentRepository.findByRazorpayOrderId(request.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Payment record not found"));

            if (Payment.PaymentStatus.SUCCESS.equals(payment.getStatus())
                    && request.getPaymentId().equals(payment.getRazorpayPaymentId())) {
                return payment;
            }

            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            payment.setRazorpayPaymentId(request.getPaymentId());
            payment.setGatewayTransactionId(request.getPaymentId());

            Payment saved = paymentRepository.save(payment);
            confirmBooking(saved.getBookingId());
            return saved;

        } catch (Exception e) {
            throw new RuntimeException("Payment verification failed: " + e.getMessage());
        }
    }

    @Override
    public Payment handleWebhook(String rawBody, String signatureHeader) {
        if (rawBody == null || rawBody.isBlank()) {
            throw new RuntimeException("Webhook payload is required");
        }
        if (signatureHeader == null || signatureHeader.isBlank()) {
            throw new RuntimeException("Webhook signature is required");
        }

        String expectedSignature = hmacSHA256(rawBody, razorpayWebhookSecret);
        if (!expectedSignature.equals(signatureHeader)) {
            throw new RuntimeException("Invalid webhook signature");
        }

        JSONObject event = new JSONObject(rawBody);
        String eventType = event.optString("event", "");
        JSONObject payload = event.optJSONObject("payload");
        JSONObject paymentContainer = payload != null ? payload.optJSONObject("payment") : null;
        JSONObject paymentEntity = paymentContainer != null ? paymentContainer.optJSONObject("entity") : null;

        if (paymentEntity == null) {
            return null;
        }

        String razorpayOrderId = paymentEntity.optString("order_id", null);
        String razorpayPaymentId = paymentEntity.optString("id", null);
        String status = paymentEntity.optString("status", "");

        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new RuntimeException("Payment record not found for webhook order"));

        if (Payment.PaymentStatus.SUCCESS.equals(payment.getStatus())
                && razorpayPaymentId != null
                && razorpayPaymentId.equals(payment.getRazorpayPaymentId())) {
            return payment;
        }

        if (eventType.startsWith("payment.") || "captured".equalsIgnoreCase(status) || "authorized".equalsIgnoreCase(status)) {
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            payment.setRazorpayPaymentId(razorpayPaymentId);
            payment.setGatewayTransactionId(event.optString("created_at", payment.getGatewayTransactionId()));
            Payment saved = paymentRepository.save(payment);
            confirmBooking(saved.getBookingId());
            return saved;
        }

        if (eventType.startsWith("payment.failed") || "failed".equalsIgnoreCase(status)) {
            payment.setStatus(Payment.PaymentStatus.FAILED);
            payment.setFailureReason(paymentEntity.optString("error_description", "Webhook payment failure"));
            return paymentRepository.save(payment);
        }

        return payment;
    }

    @Override
    public Payment refundPayment(Long paymentId, BigDecimal refundAmount) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (!Payment.PaymentStatus.SUCCESS.equals(payment.getStatus())) {
            throw new RuntimeException("Only successful payments can be refunded");
        }

        try {
            RazorpayClient client = razorpayProvider.getClient();
            
            JSONObject refundRequest = new JSONObject();
            refundRequest.put("amount", refundAmount.multiply(BigDecimal.valueOf(100)).intValue());

            client.payments.refund(payment.getRazorpayPaymentId(), refundRequest);

            payment.setStatus(Payment.PaymentStatus.REFUNDED);
            payment.setRefundAmount(refundAmount);

            return paymentRepository.save(payment);

        } catch (Exception e) {
            throw new RuntimeException("Refund failed: " + e.getMessage());
        }
    }

    @Override
    public Payment getPaymentById(Long paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    @Override
    public Payment getPaymentByTransactionId(String transactionId) {
        return paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    @Override
    public List<Payment> getPaymentsByBookingId(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId);
    }

    @Override
    public List<Payment> getPaymentsByUserId(Long userId) {
        return paymentRepository.findByUserId(userId);
    }

    @Override
    public List<Payment> getPaymentsByStatus(Payment.PaymentStatus status) {
        return paymentRepository.findByStatus(status);
    }

    @Override
    public byte[] generatePaymentReceiptPdf(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        try (PDDocument document = new PDDocument(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                writePdfLine(content, 700, "SkyBooker Payment Receipt", 16);
                writePdfLine(content, 670, "Payment ID: " + payment.getId(), 12);
                writePdfLine(content, 650, "Transaction ID: " + payment.getTransactionId(), 12);
                writePdfLine(content, 630, "Razorpay Order ID: " + payment.getRazorpayOrderId(), 12);
                writePdfLine(content, 610, "Razorpay Payment ID: " + payment.getRazorpayPaymentId(), 12);
                writePdfLine(content, 590, "Booking ID: " + payment.getBookingId(), 12);
                writePdfLine(content, 570, "User ID: " + payment.getUserId(), 12);
                writePdfLine(content, 550, "Amount: " + payment.getAmount(), 12);
                writePdfLine(content, 530, "Method: " + payment.getPaymentMethod(), 12);
                writePdfLine(content, 510, "Status: " + payment.getStatus(), 12);
                writePdfLine(content, 490, "Transaction Date: " + payment.getTransactionDate(), 12);
                writePdfLine(content, 470, "Refund Amount: " + payment.getRefundAmount(), 12);
            }

            document.save(outputStream);
            return outputStream.toByteArray();
        } catch (IOException ex) {
            throw new RuntimeException("Failed to generate payment receipt PDF", ex);
        }
    }

    private String generateTransactionId() {
        return "TXN_" + UUID.randomUUID().toString();
    }

    private String hmacSHA256(String data, String secret) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec secretKeySpec = new javax.crypto.spec.SecretKeySpec(
                    secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error computing HMAC: " + e.getMessage());
        }
    }

    private void confirmBooking(Long bookingId) {
        String confirmBookingUrl = bookingBaseUrl + "/bookings/" + bookingId + "/status?status=CONFIRMED";
        new RestTemplate().put(confirmBookingUrl, null);
    }

    private void writePdfLine(PDPageContentStream content, float y, String text, int fontSize) throws IOException {
        content.beginText();
        content.setFont(PDType1Font.HELVETICA, fontSize);
        content.newLineAtOffset(70, y);
        content.showText(text);
        content.endText();
    }
}
