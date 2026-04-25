package com.skyBooker.notification.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long bookingId;

    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private Channel channel;

    @Column(nullable = false, length = 500)
    private String subject;

    @Column(nullable = false, length = 2000)
    private String message;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private NotificationStatus status;

    @Column(nullable = false)
    private Boolean isRead;

    @Column(name = "recipient")
    private String recipient;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        status = NotificationStatus.PENDING;
        isRead = Boolean.FALSE;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum NotificationType {
        BOOKING_CONFIRMATION, PAYMENT_SUCCESS, CHECK_IN_REMINDER, FLIGHT_UPDATE, CANCELLATION, REFUND
    }

    public enum Channel {
        EMAIL, SMS, IN_APP, PUSH_NOTIFICATION
    }

    public enum NotificationStatus {
        PENDING, SENT, DELIVERED, FAILED, UNDELIVERABLE
    }
}
