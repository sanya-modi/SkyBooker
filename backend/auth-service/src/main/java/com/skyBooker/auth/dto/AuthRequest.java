package com.skyBooker.auth.dto;

import com.skyBooker.auth.validation.ValidationPatterns;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthRequest {

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
}
