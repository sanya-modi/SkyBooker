package com.skyBooker.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlatformBookingsSummaryResponse {
    private Long totalBookings;
    private BigDecimal totalRevenue;
    private Long totalPassengers;
}
