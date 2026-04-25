package com.skyBooker.payment.dto;

import com.skyBooker.payment.entity.Payment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private String transactionId;
    private Long bookingId;
    private Long userId;
    private BigDecimal amount;
    private Payment.PaymentMethod paymentMethod;
    private Payment.PaymentStatus status;
    private String gatewayTransactionId;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String failureReason;
    private LocalDateTime transactionDate;
    private BigDecimal refundAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
