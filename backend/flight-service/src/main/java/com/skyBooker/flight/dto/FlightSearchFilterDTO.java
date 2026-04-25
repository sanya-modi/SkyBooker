package com.skyBooker.flight.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlightSearchFilterDTO {
    private Long departureAirportId;
    private Long arrivalAirportId;
    private LocalDate departureDate;
    private LocalDate returnDate;  // For round-trip
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String departureTimeRange; // e.g., "morning", "afternoon", "evening", "night"
    private String sortBy; // "price", "departureTime", "duration"
}

