package com.skyBooker.payment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import com.skyBooker.payment.entity.Payment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RazorpayOrderRequest {
    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    private String currency = "INR";

    @NotNull(message = "Payment method is required")
    private Payment.PaymentMethod paymentMethod;
}
