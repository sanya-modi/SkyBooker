package com.skyBooker.auth.dto;

import com.skyBooker.auth.validation.ValidationPatterns;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {

    @Pattern(regexp = ValidationPatterns.NAME, message = "First name must be 2-50 alphabetic characters")
    private String firstName;

    @Pattern(regexp = ValidationPatterns.NAME, message = "Last name must be 2-50 alphabetic characters")
    private String lastName;

    @Pattern(regexp = ValidationPatterns.PHONE_NUMBER, message = "Phone number must be exactly 10 digits")
    private String phoneNumber;

    @Pattern(regexp = ValidationPatterns.PASSPORT, message = "Passport number format is invalid")
    private String passportNumber;

    @Pattern(regexp = ValidationPatterns.NATIONALITY, message = "Nationality format is invalid")
    private String nationality;

    @jakarta.validation.constraints.Size(max = 1000, message = "Profile photo URL must not exceed 1000 characters")
    private String profilePhotoUrl;

    private Boolean isActive;
}

