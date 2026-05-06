package com.skyBooker.notification.controller;

import com.skyBooker.notification.dto.*;
import com.skyBooker.notification.entity.Notification;
import com.skyBooker.notification.service.NotificationService;
import com.skyBooker.notification.service.NotificationServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class NotificationControllerTest {

    private final NotificationService notificationService = mock(NotificationService.class);
    private final NotificationServiceImpl notificationServiceImpl = mock(NotificationServiceImpl.class);
    private final NotificationController controller = new NotificationController(notificationService, notificationServiceImpl);

    @Test
    void createNotificationReturnsCreated() {
        NotificationRequest request = new NotificationRequest(1L, 2L, Notification.NotificationType.BOOKING_CONFIRMATION,
                Notification.Channel.EMAIL, "Subject", "Message", "user@test.com");
        when(notificationService.createNotification(1L, 2L, Notification.NotificationType.BOOKING_CONFIRMATION,
                Notification.Channel.EMAIL, "Subject", "Message", "user@test.com")).thenReturn(sampleNotification());

        ResponseEntity<NotificationResponse> response = controller.createNotification(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody().getRecipient()).isEqualTo("user@test.com");
    }

    @Test
    void sendNotificationReturnsOk() {
        ResponseEntity<Void> response = controller.sendNotification(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(notificationService).sendNotification(1L);
    }

    @Test
    void getNotificationByIdReturnsMappedResponse() {
        when(notificationService.getNotificationById(1L)).thenReturn(sampleNotification());

        ResponseEntity<NotificationResponse> response = controller.getNotificationById(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getId()).isEqualTo(1L);
    }

    @Test
    void getNotificationsByUserIdReturnsMappedList() {
        when(notificationService.getNotificationsByUserId(5L)).thenReturn(List.of(sampleNotification()));

        ResponseEntity<List<NotificationResponse>> response = controller.getNotificationsByUserId(5L);

        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void getUnreadNotificationsByUserIdReturnsMappedList() {
        when(notificationService.getUnreadNotificationsByUserId(5L)).thenReturn(List.of(sampleNotification()));

        ResponseEntity<List<NotificationResponse>> response = controller.getUnreadNotificationsByUserId(5L);

        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void getNotificationsByBookingIdReturnsMappedList() {
        when(notificationService.getNotificationsByBookingId(2L)).thenReturn(List.of(sampleNotification()));

        ResponseEntity<List<NotificationResponse>> response = controller.getNotificationsByBookingId(2L);

        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void getPendingNotificationsReturnsMappedList() {
        when(notificationService.getPendingNotifications()).thenReturn(List.of(sampleNotification()));

        ResponseEntity<List<NotificationResponse>> response = controller.getPendingNotifications();

        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void markAsReadReturnsOk() {
        ResponseEntity<Void> response = controller.markAsRead(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(notificationService).markAsRead(1L);
    }

    @Test
    void markAllAsReadReturnsOk() {
        ResponseEntity<Void> response = controller.markAllAsRead(5L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(notificationService).markAllAsRead(5L);
    }

    @Test
    void getUnreadCountReturnsOk() {
        when(notificationService.getUnreadCount(5L)).thenReturn(4L);

        ResponseEntity<Long> response = controller.getUnreadCount(5L);

        assertThat(response.getBody()).isEqualTo(4L);
    }

    @Test
    void sendBulkReturnsCreated() {
        BulkNotificationRequest request = new BulkNotificationRequest(1L, 2L, Notification.NotificationType.BOOKING_CONFIRMATION,
                Notification.Channel.EMAIL, "Subject", "Message", "user@test.com");
        when(notificationService.sendBulk(org.mockito.ArgumentMatchers.anyList())).thenReturn(List.of(sampleNotification()));

        ResponseEntity<List<NotificationResponse>> response = controller.sendBulk(List.of(request));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void sendBookingConfirmationReturnsOkWhenChannelsPresent() {
        BookingConfirmationRequest request = new BookingConfirmationRequest("user@test.com", "9999999999", "PNR123",
                Map.of("flightNumber", "SB101", "date", "2026-05-06"), new byte[] {1, 2});

        ResponseEntity<String> response = controller.sendBookingConfirmation(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(notificationServiceImpl).sendBookingConfirmationEmail("user@test.com", "PNR123", request.getBookingDetails(), request.getTicketPdf());
        verify(notificationServiceImpl).sendBookingConfirmationSms("9999999999", "PNR123", "SB101", "2026-05-06");
    }

    @Test
    void sendBookingConfirmationReturnsErrorWhenServiceFails() {
        BookingConfirmationRequest request = new BookingConfirmationRequest("user@test.com", null, "PNR123", Map.of(), null);
        doThrow(new RuntimeException("mail down")).when(notificationServiceImpl)
                .sendBookingConfirmationEmail("user@test.com", "PNR123", Map.of(), null);

        ResponseEntity<String> response = controller.sendBookingConfirmation(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).contains("mail down");
    }

    @Test
    void sendSupportRequestReturnsOk() {
        SupportRequest request = new SupportRequest("Need help", "Issue details", "user@test.com", "John Doe");

        ResponseEntity<String> response = controller.sendSupportRequest(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(notificationServiceImpl).sendSupportEmails(request);
    }

    @Test
    void sendSupportRequestReturnsErrorWhenServiceFails() {
        SupportRequest request = new SupportRequest("Need help", "Issue details", "user@test.com", "John Doe");
        doThrow(new RuntimeException("oops")).when(notificationServiceImpl).sendSupportEmails(request);

        ResponseEntity<String> response = controller.sendSupportRequest(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).contains("oops");
    }

    @Test
    void sendFlightStatusNotificationsReturnsOk() {
        FlightStatusNotificationRequest request = new FlightStatusNotificationRequest("SB101", "DEL-BOM", "DELAYED", "Late",
                List.of(new FlightStatusNotificationRequest.Recipient(1L, 2L, "user@test.com")));

        ResponseEntity<Void> response = controller.sendFlightStatusNotifications(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(notificationServiceImpl).sendFlightStatusNotifications(request);
    }

    @Test
    void sendAdminNotificationsReturnsOk() {
        AdminNotificationDispatchRequest request = new AdminNotificationDispatchRequest("Subject", "Message", "BOOKING_CONFIRMATION",
                List.of(new AdminNotificationRecipientRequest(1L, "user@test.com")));

        ResponseEntity<Void> response = controller.sendAdminNotifications(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(notificationServiceImpl).sendAdminNotifications(request);
    }

    private Notification sampleNotification() {
        Notification n = new Notification();
        n.setId(1L);
        n.setUserId(5L);
        n.setBookingId(2L);
        n.setType(Notification.NotificationType.BOOKING_CONFIRMATION);
        n.setChannel(Notification.Channel.EMAIL);
        n.setSubject("Subject");
        n.setMessage("Message");
        n.setStatus(Notification.NotificationStatus.DELIVERED);
        n.setIsRead(false);
        n.setRecipient("user@test.com");
        n.setCreatedAt(LocalDateTime.of(2026, 1, 1, 10, 0));
        n.setUpdatedAt(LocalDateTime.of(2026, 1, 1, 10, 5));
        return n;
    }
}
