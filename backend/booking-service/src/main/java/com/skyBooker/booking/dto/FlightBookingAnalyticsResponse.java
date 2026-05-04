package com.skyBooker.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlightBookingAnalyticsResponse {
    private Long flightId;
    private Long bookingsCount;
    private BigDecimal revenue;
}
