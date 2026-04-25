package com.skyBooker.booking.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {

    @NotNull(message = "User ID is required")
    @Positive(message = "User ID must be positive")
    private Long userId;

    @NotNull(message = "Flight ID is required")
    @Positive(message = "Flight ID must be positive")
    private Long flightId;

    @NotNull(message = "Number of passengers is required")
    @Positive(message = "Number of passengers must be positive")
    private Integer numberOfPassengers;

    @NotNull(message = "Selected seats are required")
    private List<String> selectedSeats;

    private String specialRequests;
}
