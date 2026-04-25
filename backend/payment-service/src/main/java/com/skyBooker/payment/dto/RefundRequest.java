package com.skyBooker.payment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RefundRequest {

    @NotNull(message = "Refund amount is required")
    @DecimalMin(value = "0.01", inclusive = true, message = "Refund amount must be greater than zero")
    private BigDecimal refundAmount;
}
