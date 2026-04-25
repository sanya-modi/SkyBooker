package com.skyBooker.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RazorpayOrderResponse {
    private String orderId;
    private String keyId;
    private BigDecimal amount;
    private String currency;
    private Long userId;
    private String userEmail;
    private String userName;
}
