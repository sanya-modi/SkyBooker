package com.skyBooker.notification.controller;

import com.skyBooker.notification.dto.BookingConfirmationRequest;
import com.skyBooker.notification.dto.NotificationRequest;
import com.skyBooker.notification.dto.NotificationResponse;
import com.skyBooker.notification.dto.BulkNotificationRequest;
import com.skyBooker.notification.entity.Notification;
import com.skyBooker.notification.service.NotificationService;
import com.skyBooker.notification.service.NotificationServiceImpl;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Validated
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationServiceImpl notificationServiceImpl;

    @PostMapping
    public ResponseEntity<NotificationResponse> createNotification(@Valid @RequestBody NotificationRequest request) {
        Notification notification = notificationService.createNotification(
                request.getUserId(),
                request.getBookingId(),
                request.getType(),
                request.getChannel(),
                request.getSubject(),
                request.getMessage(),
                request.getRecipient()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(notification));
    }

    @PostMapping("/{notificationId}/send")
    public ResponseEntity<Void> sendNotification(@PathVariable @Positive(message = "notificationId must be positive") Long notificationId) {
        notificationService.sendNotification(notificationId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{notificationId}")
    public ResponseEntity<NotificationResponse> getNotificationById(@PathVariable @Positive(message = "notificationId must be positive") Long notificationId) {
        return ResponseEntity.ok(mapToResponse(notificationService.getNotificationById(notificationId)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> getNotificationsByUserId(@PathVariable @Positive(message = "userId must be positive") Long userId) {
        return ResponseEntity.ok(notificationService.getNotificationsByUserId(userId).stream().map(this::mapToResponse).collect(Collectors.toList()));
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotificationsByUserId(@PathVariable @Positive(message = "userId must be positive") Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotificationsByUserId(userId).stream().map(this::mapToResponse).collect(Collectors.toList()));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<NotificationResponse>> getNotificationsByBookingId(@PathVariable @Positive(message = "bookingId must be positive") Long bookingId) {
        return ResponseEntity.ok(notificationService.getNotificationsByBookingId(bookingId).stream().map(this::mapToResponse).collect(Collectors.toList()));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<NotificationResponse>> getPendingNotifications() {
        return ResponseEntity.ok(notificationService.getPendingNotifications().stream().map(this::mapToResponse).collect(Collectors.toList()));
    }

    @PutMapping("/{notificationId}/mark-read")
    public ResponseEntity<Void> markAsRead(@PathVariable @Positive(message = "notificationId must be positive") Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/user/{userId}/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(@PathVariable @Positive(message = "userId must be positive") Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable @Positive(message = "userId must be positive") Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<NotificationResponse>> sendBulk(@Valid @RequestBody List<BulkNotificationRequest> requestList) {
        List<Notification> notifications = requestList.stream().map(this::mapBulkToEntity).collect(Collectors.toList());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(notificationService.sendBulk(notifications).stream().map(this::mapToResponse).collect(Collectors.toList()));
    }

    @PostMapping("/booking-confirmation")
    public ResponseEntity<String> sendBookingConfirmation(@RequestBody BookingConfirmationRequest request) {
        try {
            if (request.getEmail() != null && !request.getEmail().isBlank()) {
                notificationServiceImpl.sendBookingConfirmationEmail(
                    request.getEmail(),
                    request.getPnr(),
                    request.getBookingDetails(),
                    request.getTicketPdf()
                );
            }
            
            if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
                String flightNumber = request.getBookingDetails().getOrDefault("flightNumber", "N/A").toString();
                String date = request.getBookingDetails().getOrDefault("date", "N/A").toString();
                notificationServiceImpl.sendBookingConfirmationSms(
                    request.getPhoneNumber(),
                    request.getPnr(),
                    flightNumber,
                    date
                );
            }
            
            return ResponseEntity.ok("Booking confirmation sent successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to send booking confirmation: " + e.getMessage());
        }
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getUserId(),
                notification.getBookingId(),
                notification.getType(),
                notification.getChannel(),
                notification.getSubject(),
                notification.getMessage(),
                notification.getStatus(),
                notification.getIsRead(),
                notification.getRecipient(),
                notification.getCreatedAt(),
                notification.getUpdatedAt()
        );
    }

    private Notification mapBulkToEntity(BulkNotificationRequest request) {
        Notification notification = new Notification();
        notification.setUserId(request.getUserId());
        notification.setBookingId(request.getBookingId());
        notification.setType(request.getType());
        notification.setChannel(request.getChannel());
        notification.setSubject(request.getSubject());
        notification.setMessage(request.getMessage());
        notification.setRecipient(request.getRecipient());
        return notification;
    }
}
