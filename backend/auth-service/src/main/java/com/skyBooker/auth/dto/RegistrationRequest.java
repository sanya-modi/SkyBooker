package com.skyBooker.auth.dto;

import com.skyBooker.auth.validation.ValidationPatterns;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationRequest {

    @NotBlank(message = "First name is required")
    @Pattern(regexp = ValidationPatterns.NAME, message = "First name must be 2-50 alphabetic characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Pattern(regexp = ValidationPatterns.NAME, message = "Last name must be 2-50 alphabetic characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Pattern(regexp = ValidationPatterns.EMAIL, message = "Email format is invalid")
    private String email;

    @NotBlank(message = "Password is required")
    @Pattern(
            regexp = ValidationPatterns.PASSWORD,
            message = "Password must be 8-15 chars with upper, lower, digit, and special character"
    )
    private String password;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = ValidationPatterns.PHONE_NUMBER, message = "Phone number must be 10 digits or E.164 format")
    private String phoneNumber;

    @NotNull(message = "Role is required")
    private UserRole role;

    @Pattern(regexp = ValidationPatterns.PASSPORT, message = "Passport number format is invalid")
    private String passportNumber;

    @Pattern(regexp = ValidationPatterns.NATIONALITY, message = "Nationality format is invalid")
    private String nationality;

    public enum UserRole {
        PASSENGER, ADMIN, AIRLINE_STAFF
    }
}
