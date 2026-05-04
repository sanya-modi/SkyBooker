package com.skyBooker.booking.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.time.LocalDate;

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

    @DecimalMin(value = "0.00", inclusive = true, message = "Taxes must be zero or positive")
    private BigDecimal taxes;

    @DecimalMin(value = "0.00", inclusive = true, message = "Seat charge must be zero or positive")
    private BigDecimal seatCharge;

    @DecimalMin(value = "0.00", inclusive = true, message = "Meal charge must be zero or positive")
    private BigDecimal mealCharge;

    @DecimalMin(value = "0.00", inclusive = true, message = "Baggage charge must be zero or positive")
    private BigDecimal baggageCharge;

    private List<PassengerValidationRequest> passengers;

    private String specialRequests;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PassengerValidationRequest {
        @NotNull(message = "Date of birth is required")
        private LocalDate dateOfBirth;

        @NotNull(message = "Passenger category is required")
        private PassengerCategory category;
    }

    public enum PassengerCategory {
        ADULT, CHILD, INFANT
    }
}
