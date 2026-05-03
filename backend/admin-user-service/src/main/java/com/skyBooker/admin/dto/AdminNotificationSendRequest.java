package com.skyBooker.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminNotificationSendRequest {

    @NotBlank(message = "Subject is required")
    @Pattern(regexp = "^[\\s\\S]{1,500}$", message = "Subject format is invalid")
    private String subject;

    @NotBlank(message = "Message is required")
    @Pattern(regexp = "^[\\s\\S]{1,2000}$", message = "Message format is invalid")
    private String message;

    @NotBlank(message = "Target audience is required")
    @Pattern(regexp = "^(ALL|PASSENGER|AIRLINE_STAFF|ADMIN)$", message = "Target audience is invalid")
    private String targetAudience;

    @NotBlank(message = "Notification type is required")
    @Pattern(
            regexp = "^(BOOKING_CONFIRMATION|PAYMENT_SUCCESS|CHECK_IN_REMINDER|FLIGHT_UPDATE|CANCELLATION|REFUND)$",
            message = "Notification type is invalid"
    )
    private String type;
}
