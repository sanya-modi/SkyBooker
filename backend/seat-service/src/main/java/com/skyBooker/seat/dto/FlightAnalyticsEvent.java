package com.skyBooker.seat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlightAnalyticsEvent {
    private Long flightId;
    private Integer totalSeats;
    private Integer bookedSeats;
    private Integer availableSeats;
    private BigDecimal revenue;
    private Integer bookingsCount;
}
