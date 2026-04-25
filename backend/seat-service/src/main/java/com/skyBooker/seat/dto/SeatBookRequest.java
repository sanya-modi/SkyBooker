package com.skyBooker.seat.dto;

import com.skyBooker.seat.validation.SeatValidationPatterns;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatBookRequest {

    @NotNull(message = "Flight id is required")
    @Positive(message = "Flight id must be positive")
    private Long flightId;

    @NotBlank(message = "Seat number is required")
    @Pattern(regexp = SeatValidationPatterns.SEAT_NUMBER, message = "Seat number format is invalid")
    private String seatNumber;

    @NotNull(message = "Booking id is required")
    @Positive(message = "Booking id must be positive")
    private Long bookingId;

    @NotNull(message = "Passenger id is required")
    @Positive(message = "Passenger id must be positive")
    private Long passengerId;
}
