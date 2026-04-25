package com.skyBooker.payment.service;

import com.skyBooker.payment.dto.PaymentVerificationRequest;
import com.skyBooker.payment.dto.RazorpayOrderRequest;
import com.skyBooker.payment.dto.RazorpayOrderResponse;
import com.skyBooker.payment.entity.Payment;

import java.math.BigDecimal;
import java.util.List;

public interface PaymentService {
    RazorpayOrderResponse createRazorpayOrder(RazorpayOrderRequest request, String userEmail, String userName);
    Payment verifyAndProcessPayment(PaymentVerificationRequest request);
    Payment refundPayment(Long paymentId, BigDecimal refundAmount);
    Payment getPaymentById(Long paymentId);
    Payment getPaymentByTransactionId(String transactionId);
    List<Payment> getPaymentsByBookingId(Long bookingId);
    List<Payment> getPaymentsByUserId(Long userId);
    List<Payment> getPaymentsByStatus(Payment.PaymentStatus status);
    byte[] generatePaymentReceiptPdf(Long paymentId);
    Payment handleWebhook(String rawBody, String signatureHeader);
}
