package com.skyBooker.payment.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skyBooker.payment.config.GlobalExceptionHandler;
import com.skyBooker.payment.dto.PaymentResponse;
import com.skyBooker.payment.dto.PaymentVerificationRequest;
import com.skyBooker.payment.dto.RazorpayOrderRequest;
import com.skyBooker.payment.dto.RazorpayOrderResponse;
import com.skyBooker.payment.dto.RefundRequest;
import com.skyBooker.payment.entity.Payment;
import com.skyBooker.payment.service.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class PaymentControllerTest {

    @Mock
    private PaymentService paymentService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new PaymentController(paymentService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper().findAndRegisterModules();
    }

    @Test
    void createRazorpayOrderReturnsCreatedResponse() throws Exception {
        when(paymentService.createRazorpayOrder(any(), eq("user@example.com"), eq("John"))).thenReturn(
                RazorpayOrderResponse.builder()
                        .orderId("order_123")
                        .keyId("rzp_test_key")
                        .amount(new BigDecimal("2500"))
                        .currency("INR")
                        .userId(3L)
                        .userEmail("user@example.com")
                        .userName("John")
                        .build()
        );

        mockMvc.perform(post("/payments/razorpay/create-order")
                        .header("X-User-Email", "user@example.com")
                        .header("X-User-Name", "John")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleOrderRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderId").value("order_123"));
    }

    @Test
    void verifyPaymentReturnsMappedResponse() throws Exception {
        when(paymentService.verifyAndProcessPayment(any())).thenReturn(samplePayment());

        mockMvc.perform(post("/payments/razorpay/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PaymentVerificationRequest("order_123", "pay_123", "sig"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transactionId").value("TXN"));
    }

    @Test
    void webhookReturnsIgnoredMessageWhenServiceReturnsNull() throws Exception {
        when(paymentService.handleWebhook(any(), eq("sig"))).thenReturn(null);

        mockMvc.perform(post("/payments/webhooks/razorpay")
                        .header("X-Razorpay-Signature", "sig")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(content().string("Webhook ignored"));
    }

    @Test
    void webhookReturnsMappedPaymentWhenProcessed() throws Exception {
        when(paymentService.handleWebhook(any(), eq("sig"))).thenReturn(samplePayment());

        mockMvc.perform(post("/payments/webhooks/razorpay")
                        .header("X-Razorpay-Signature", "sig")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));
    }

    @Test
    void downloadReceiptReturnsPdf() throws Exception {
        when(paymentService.generatePaymentReceiptPdf(1L)).thenReturn("pdf".getBytes());

        mockMvc.perform(get("/payments/1/receipt"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=payment-receipt-1.pdf"))
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));
    }

    @Test
    void refundPaymentReturnsMappedResponse() throws Exception {
        when(paymentService.refundPayment(1L, new BigDecimal("10.00"))).thenReturn(samplePayment());

        mockMvc.perform(post("/payments/1/refund")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RefundRequest(new BigDecimal("10.00")))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void getPaymentByIdReturnsResponse() throws Exception {
        when(paymentService.getPaymentById(1L)).thenReturn(samplePayment());

        mockMvc.perform(get("/payments/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookingId").value(2));
    }

    @Test
    void getPaymentByTransactionIdReturnsResponse() throws Exception {
        when(paymentService.getPaymentByTransactionId("TXN")).thenReturn(samplePayment());

        mockMvc.perform(get("/payments/transaction/TXN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(3));
    }

    @Test
    void getPaymentsByBookingIdReturnsList() throws Exception {
        when(paymentService.getPaymentsByBookingId(2L)).thenReturn(List.of(samplePayment()));

        mockMvc.perform(get("/payments/booking/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].transactionId").value("TXN"));
    }

    @Test
    void getPaymentsByUserIdReturnsList() throws Exception {
        when(paymentService.getPaymentsByUserId(3L)).thenReturn(List.of(samplePayment()));

        mockMvc.perform(get("/payments/user/3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("SUCCESS"));
    }

    @Test
    void getPaymentsByStatusReturnsList() throws Exception {
        when(paymentService.getPaymentsByStatus(Payment.PaymentStatus.SUCCESS)).thenReturn(List.of(samplePayment()));

        mockMvc.perform(get("/payments/status/SUCCESS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].paymentMethod").value("UPI"));
    }

    @Test
    void createRazorpayOrderWithInvalidRequestReturnsBadRequest() throws Exception {
        RazorpayOrderRequest invalid = sampleOrderRequest();
        invalid.setAmount(BigDecimal.ZERO);

        mockMvc.perform(post("/payments/razorpay/create-order")
                        .header("X-User-Email", "user@example.com")
                        .header("X-User-Name", "John")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"));
    }

    private RazorpayOrderRequest sampleOrderRequest() {
        return new RazorpayOrderRequest(2L, 3L, new BigDecimal("2500"), "INR", Payment.PaymentMethod.UPI);
    }

    private Payment samplePayment() {
        Payment payment = new Payment();
        payment.setId(1L);
        payment.setTransactionId("TXN");
        payment.setBookingId(2L);
        payment.setUserId(3L);
        payment.setAmount(new BigDecimal("2500"));
        payment.setPaymentMethod(Payment.PaymentMethod.UPI);
        payment.setStatus(Payment.PaymentStatus.SUCCESS);
        payment.setGatewayTransactionId("gateway_123");
        payment.setRazorpayOrderId("order_123");
        payment.setRazorpayPaymentId("pay_123");
        payment.setFailureReason(null);
        payment.setTransactionDate(LocalDateTime.now());
        payment.setRefundAmount(BigDecimal.ZERO);
        payment.setCreatedAt(LocalDateTime.now().minusDays(1));
        payment.setUpdatedAt(LocalDateTime.now());
        return payment;
    }
}
