package com.skyBooker.auth.dto;

import com.skyBooker.auth.validation.ValidationPatterns;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleLoginRequest {

    @NotBlank(message = "Google ID token is required")
    @Pattern(regexp = ValidationPatterns.JWT_LIKE_TOKEN, message = "Google ID token format is invalid")
    private String idToken;
}
