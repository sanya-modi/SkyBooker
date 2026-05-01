package com.skyBooker.passenger.dto;

import com.skyBooker.passenger.entity.Passenger;
import com.skyBooker.passenger.validation.PassengerValidationPatterns;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PassengerRequest {

    @NotNull(message = "Booking id is required")
    @Positive(message = "Booking id must be positive")
    private Long bookingId;

    @NotBlank(message = "First name is required")
    @Pattern(regexp = PassengerValidationPatterns.NAME, message = "First name format is invalid")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Pattern(regexp = PassengerValidationPatterns.NAME, message = "Last name format is invalid")
    private String lastName;

    @Email(message = "Email format is invalid")
    private String email;

    @Pattern(regexp = "^\\d{10}$", message = "Phone number must be exactly 10 digits")
    private String phoneNumber;

    @NotBlank(message = "Passport number is required")
    @Pattern(regexp = PassengerValidationPatterns.PASSPORT, message = "Passport number format is invalid")
    private String passportNumber;

    @NotNull(message = "Date of birth is required")
    private LocalDate dateOfBirth;

    @NotNull(message = "Category is required")
    private Passenger.Category category;

    @NotNull(message = "Gender is required")
    private Passenger.Gender gender;

    @NotBlank(message = "Nationality is required")
    @Pattern(regexp = PassengerValidationPatterns.NATIONALITY, message = "Nationality format is invalid")
    private String nationality;

    @Pattern(regexp = PassengerValidationPatterns.SPECIAL_REQUESTS, message = "Special requests format is invalid")
    private String specialRequests;
}
