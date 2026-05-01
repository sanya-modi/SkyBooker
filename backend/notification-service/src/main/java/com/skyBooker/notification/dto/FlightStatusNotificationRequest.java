package com.skyBooker.notification.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlightStatusNotificationRequest {
    @NotBlank
    private String flightNumber;

    @NotBlank
    private String route;

    @NotBlank
    private String status;

    @NotBlank
    private String message;

    @Valid
    @NotEmpty
    private List<Recipient> recipients;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Recipient {
        @NotNull
        private Long userId;

        @NotNull
        private Long bookingId;

        @Email
        @NotBlank
        private String email;
    }
}
