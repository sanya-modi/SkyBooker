package com.skyBooker.payment.controller;

import com.skyBooker.payment.dto.RazorpayOrderRequest;
import com.skyBooker.payment.dto.RazorpayOrderResponse;
import com.skyBooker.payment.dto.PaymentVerificationRequest;
import com.skyBooker.payment.dto.PaymentResponse;
import com.skyBooker.payment.dto.RefundRequest;
import com.skyBooker.payment.entity.Payment;
import com.skyBooker.payment.service.PaymentService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Validated
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/razorpay/create-order")
    public ResponseEntity<RazorpayOrderResponse> createRazorpayOrder(
            @Valid @RequestBody RazorpayOrderRequest request,
            @RequestHeader("X-User-Email") String userEmail,
            @RequestHeader("X-User-Name") String userName) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.createRazorpayOrder(request, userEmail, userName));
    }

    @PostMapping("/razorpay/verify")
    public ResponseEntity<PaymentResponse> verifyPayment(@Valid @RequestBody PaymentVerificationRequest request) {
        return ResponseEntity.ok(mapToResponse(paymentService.verifyAndProcessPayment(request)));
    }

    @PostMapping("/webhooks/razorpay")
    public ResponseEntity<?> handleRazorpayWebhook(
            @RequestBody String rawBody,
            @RequestHeader(name = "X-Razorpay-Signature", required = true) String signature
    ) {
        Payment payment = paymentService.handleWebhook(rawBody, signature);
        return ResponseEntity.ok(payment == null ? "Webhook ignored" : mapToResponse(payment));
    }

    @GetMapping(value = "/{paymentId}/receipt", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> downloadReceipt(@PathVariable @Positive(message = "paymentId must be positive") Long paymentId) {
        byte[] pdf = paymentService.generatePaymentReceiptPdf(paymentId);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=payment-receipt-" + paymentId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @PostMapping("/{paymentId}/refund")
    public ResponseEntity<PaymentResponse> refundPayment(
            @PathVariable @Positive(message = "paymentId must be positive") Long paymentId,
            @Valid @RequestBody RefundRequest request
    ) {
        return ResponseEntity.ok(mapToResponse(paymentService.refundPayment(paymentId, request.getRefundAmount())));
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable @Positive(message = "paymentId must be positive") Long paymentId) {
        return ResponseEntity.ok(mapToResponse(paymentService.getPaymentById(paymentId)));
    }

    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<PaymentResponse> getPaymentByTransactionId(@PathVariable String transactionId) {
        return ResponseEntity.ok(mapToResponse(paymentService.getPaymentByTransactionId(transactionId)));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByBookingId(@PathVariable @Positive(message = "bookingId must be positive") Long bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentsByBookingId(bookingId).stream().map(this::mapToResponse).collect(Collectors.toList()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByUserId(@PathVariable @Positive(message = "userId must be positive") Long userId) {
        return ResponseEntity.ok(paymentService.getPaymentsByUserId(userId).stream().map(this::mapToResponse).collect(Collectors.toList()));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(paymentService.getPaymentsByStatus(Payment.PaymentStatus.valueOf(status)).stream().map(this::mapToResponse).collect(Collectors.toList()));
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getTransactionId(),
                payment.getBookingId(),
                payment.getUserId(),
                payment.getAmount(),
                payment.getPaymentMethod(),
                payment.getStatus(),
                payment.getGatewayTransactionId(),
                payment.getRazorpayOrderId(),
                payment.getRazorpayPaymentId(),
                payment.getFailureReason(),
                payment.getTransactionDate(),
                payment.getRefundAmount(),
                payment.getCreatedAt(),
                payment.getUpdatedAt()
        );
    }
}
