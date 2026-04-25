package com.skyBooker.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    private Long id;
    private String pnr;
    private Long userId;
    private Long flightId;
    private Integer numberOfPassengers;
    private BigDecimal baseFare;
    private BigDecimal taxes;
    private BigDecimal ancillaryCharges;
    private BigDecimal totalFare;
    private String status;
    private LocalDateTime bookingDate;
    private Boolean checkedIn;
    private LocalDateTime checkedInAt;
    private List<String> selectedSeats;
}
