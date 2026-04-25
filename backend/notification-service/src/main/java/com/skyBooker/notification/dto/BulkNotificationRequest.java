package com.skyBooker.notification.dto;

import com.skyBooker.notification.entity.Notification;
import com.skyBooker.notification.validation.NotificationValidationPatterns;
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
public class BulkNotificationRequest {

    @NotNull(message = "User id is required")
    @Positive(message = "User id must be positive")
    private Long userId;

    @NotNull(message = "Booking id is required")
    @Positive(message = "Booking id must be positive")
    private Long bookingId;

    @NotNull(message = "Notification type is required")
    private Notification.NotificationType type;

    @NotNull(message = "Channel is required")
    private Notification.Channel channel;

    @NotBlank(message = "Subject is required")
    @Pattern(regexp = NotificationValidationPatterns.SUBJECT, message = "Subject format is invalid")
    private String subject;

    @NotBlank(message = "Message is required")
    @Pattern(regexp = NotificationValidationPatterns.MESSAGE, message = "Message format is invalid")
    private String message;

    @NotBlank(message = "Recipient is required")
    @Pattern(regexp = NotificationValidationPatterns.RECIPIENT, message = "Recipient format is invalid")
    private String recipient;
}
