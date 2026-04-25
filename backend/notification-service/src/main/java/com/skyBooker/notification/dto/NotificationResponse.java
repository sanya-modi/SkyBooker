package com.skyBooker.notification.dto;

import com.skyBooker.notification.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private Long userId;
    private Long bookingId;
    private Notification.NotificationType type;
    private Notification.Channel channel;
    private String subject;
    private String message;
    private Notification.NotificationStatus status;
    private Boolean isRead;
    private String recipient;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
