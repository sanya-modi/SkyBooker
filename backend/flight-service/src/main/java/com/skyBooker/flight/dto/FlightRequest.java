package com.skyBooker.flight.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlightRequest {

    @NotBlank(message = "Flight number is required")
    private String flightNumber;

    @NotBlank(message = "Aircraft type is required")
    private String aircraftType;

    @NotNull(message = "Airline ID is required")
    @Positive(message = "Airline ID must be positive")
    private Long airlineId;

    @NotNull(message = "Departure airport ID is required")
    @Positive(message = "Departure airport ID must be positive")
    private Long departureAirportId;

    @NotNull(message = "Arrival airport ID is required")
    @Positive(message = "Arrival airport ID must be positive")
    private Long arrivalAirportId;

    @NotNull(message = "Departure time is required")
    @FutureOrPresent(message = "Departure time must be in future")
    private LocalDateTime departureTime;

    @NotNull(message = "Arrival time is required")
    @FutureOrPresent(message = "Arrival time must be in future")
    private LocalDateTime arrivalTime;

    @NotNull(message = "Total seats is required")
    @Positive(message = "Total seats must be positive")
    private Integer totalSeats;

    @NotNull(message = "Base fare is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Base fare must be greater than 0")
    private BigDecimal baseFare;
}
