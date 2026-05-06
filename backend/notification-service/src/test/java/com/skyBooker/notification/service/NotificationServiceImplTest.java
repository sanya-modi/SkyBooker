package com.skyBooker.notification.service;

import com.skyBooker.notification.dto.AdminNotificationDispatchRequest;
import com.skyBooker.notification.dto.AdminNotificationRecipientRequest;
import com.skyBooker.notification.dto.FlightStatusNotificationRequest;
import com.skyBooker.notification.entity.Notification;
import com.skyBooker.notification.repository.NotificationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock private NotificationRepository repo;
    @Mock private EmailService emailService;
    @Mock private SmsService smsService;

    @InjectMocks
    private NotificationServiceImpl service;

    // ================= CREATE =================

    @Test
    void createNotification() {
        when(repo.save(any())).thenAnswer(i -> i.getArgument(0));

        Notification n = service.createNotification(
                1L, 2L,
                Notification.NotificationType.BOOKING_CONFIRMATION,
                Notification.Channel.EMAIL,
                "Sub", "Msg", "user@test.com"
        );

        assertThat(n.getRecipient()).isEqualTo("user@test.com");
    }

    // ================= SEND =================

    @Test
    void sendEmailNotification() {
        Notification n = baseNotification(Notification.Channel.EMAIL);

        when(repo.findById(1L)).thenReturn(Optional.of(n));

        service.sendNotification(1L);

        verify(emailService).sendGenericEmail(anyString(), anyString(), anyString());
        assertThat(n.getStatus()).isEqualTo(Notification.NotificationStatus.DELIVERED);
    }

    @Test
    void sendSmsNotification() {
        Notification n = baseNotification(Notification.Channel.SMS);

        n.setType(Notification.NotificationType.BOOKING_CONFIRMATION);
        n.setRecipient("9999999999");

        when(repo.findById(1L)).thenReturn(Optional.of(n));

        service.sendNotification(1L);

        // SMS branch in sendSmsNotification() just marks as DELIVERED without calling smsService
        assertThat(n.getStatus()).isEqualTo(Notification.NotificationStatus.DELIVERED);
    }

    @Test
    void sendPushNotification() {
        Notification n = baseNotification(Notification.Channel.PUSH_NOTIFICATION);

        when(repo.findById(1L)).thenReturn(Optional.of(n));

        service.sendNotification(1L);

        assertThat(n.getStatus()).isEqualTo(Notification.NotificationStatus.DELIVERED);
    }

    @Test
    void sendInAppNotification() {
        Notification n = baseNotification(Notification.Channel.IN_APP);

        when(repo.findById(1L)).thenReturn(Optional.of(n));

        service.sendNotification(1L);

        assertThat(n.getStatus()).isEqualTo(Notification.NotificationStatus.DELIVERED);
        verify(repo).save(n);
    }

    @Test
    void sendNotificationFailure() {
        Notification n = baseNotification(Notification.Channel.EMAIL);

        when(repo.findById(1L)).thenReturn(Optional.of(n));
        doThrow(new RuntimeException()).when(emailService)
                .sendGenericEmail(anyString(), anyString(), anyString());

        service.sendNotification(1L);

        assertThat(n.getStatus()).isEqualTo(Notification.NotificationStatus.FAILED);
    }

    @Test
    void sendNotificationThrowsWhenNotificationMissing() {
        when(repo.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.sendNotification(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Notification not found");
    }

    // ================= GET =================

    @Test
    void getNotificationById() {
        when(repo.findById(1L)).thenReturn(Optional.of(new Notification()));

        assertThat(service.getNotificationById(1L)).isNotNull();
    }

    @Test
    void getNotificationByIdThrows() {
        when(repo.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getNotificationById(1L))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void getNotificationsByUserId() {
        when(repo.findByUserId(1L)).thenReturn(List.of(new Notification()));

        assertThat(service.getNotificationsByUserId(1L)).hasSize(1);
    }

    @Test
    void getUnreadNotificationsByUserId() {
        when(repo.findUnreadByUserId(1L)).thenReturn(List.of(new Notification()));

        assertThat(service.getUnreadNotificationsByUserId(1L)).hasSize(1);
    }

    @Test
    void getNotificationsByBookingId() {
        when(repo.findByBookingId(2L)).thenReturn(List.of(new Notification()));

        assertThat(service.getNotificationsByBookingId(2L)).hasSize(1);
    }

    @Test
    void getPendingNotifications() {
        when(repo.findPendingNotifications()).thenReturn(List.of(new Notification()));

        assertThat(service.getPendingNotifications()).hasSize(1);
    }

    // ================= READ =================

    @Test
    void markAsRead() {
        Notification n = baseNotification(Notification.Channel.EMAIL);

        when(repo.findById(1L)).thenReturn(Optional.of(n));

        service.markAsRead(1L);

        assertThat(n.getIsRead()).isTrue();
        verify(repo).save(n);
    }

    @Test
    void markAllAsRead() {
        Notification n = baseNotification(Notification.Channel.EMAIL);
        n.setStatus(Notification.NotificationStatus.PENDING);

        when(repo.findUnreadByUserId(1L)).thenReturn(List.of(n));

        service.markAllAsRead(1L);

        assertThat(n.getIsRead()).isTrue();
        assertThat(n.getStatus()).isEqualTo(Notification.NotificationStatus.DELIVERED);
    }

    @Test
    void markAllAsReadKeepsDeliveredStatusUntouched() {
        Notification n = baseNotification(Notification.Channel.EMAIL);
        n.setStatus(Notification.NotificationStatus.DELIVERED);

        when(repo.findUnreadByUserId(1L)).thenReturn(List.of(n));

        service.markAllAsRead(1L);

        assertThat(n.getIsRead()).isTrue();
        assertThat(n.getStatus()).isEqualTo(Notification.NotificationStatus.DELIVERED);
    }

    // ================= COUNT =================

    @Test
    void unreadCount() {
        when(repo.countUnreadByUserId(1L)).thenReturn(5L);

        assertThat(service.getUnreadCount(1L)).isEqualTo(5L);
    }

    // ================= BULK =================

    @Test
    void sendBulk() {
        Notification n = baseNotification(Notification.Channel.EMAIL);

        when(repo.saveAll(any())).thenReturn(List.of(n));
        when(repo.findById(any())).thenReturn(Optional.of(n));

        service.sendBulk(List.of(n));

        verify(repo).saveAll(any());
    }

    @Test
    void sendBookingConfirmationEmailDelegatesToEmailService() {
        service.sendBookingConfirmationEmail("user@test.com", "PNR123", Map.of("flightNumber", "SB101"), new byte[]{1, 2});

        verify(emailService).sendBookingConfirmation(eq("user@test.com"), eq("PNR123"), anyMap(), any());
    }

    @Test
    void sendBookingConfirmationSmsDelegatesToSmsService() {
        service.sendBookingConfirmationSms("9999999999", "PNR123", "SB101", "2026-05-06");

        verify(smsService).sendBookingConfirmation("9999999999", "PNR123", "SB101", "2026-05-06");
    }

    @Test
    void sendSupportEmailsDelegatesToEmailService() {
        com.skyBooker.notification.dto.SupportRequest request = new com.skyBooker.notification.dto.SupportRequest();
        request.setTitle("Need help");
        request.setDescription("Please assist");
        request.setUserEmail("user@test.com");
        request.setFullName("John Doe");

        service.sendSupportEmails(request);

        verify(emailService).sendSupportToHost("Need help", "Please assist", "user@test.com", "John Doe");
        verify(emailService).sendSupportThankYouToUser("user@test.com", "John Doe");
    }

    // ================= FLIGHT STATUS =================

    @Test
    void sendFlightStatusNotificationsSuccess() {
        when(repo.save(any())).thenAnswer(i -> i.getArgument(0));

        FlightStatusNotificationRequest req = new FlightStatusNotificationRequest(
                "SB101", "DEL-BOM", "DELAYED", "Late",
                List.of(new FlightStatusNotificationRequest.Recipient(1L, 2L, "user@test.com"))
        );

        service.sendFlightStatusNotifications(req);

        verify(emailService).sendFlightStatusUpdate(
                anyString(), anyString(), anyString(), anyString(), anyString()
        );
    }

    @Test
    void sendFlightStatusNotificationsFailure() {
        when(repo.save(any())).thenAnswer(i -> i.getArgument(0));

        doThrow(new RuntimeException()).when(emailService)
                .sendFlightStatusUpdate(anyString(), anyString(), anyString(), anyString(), anyString());

        FlightStatusNotificationRequest req = new FlightStatusNotificationRequest(
                "SB101", "DEL-BOM", "DELAYED", "Late",
                List.of(new FlightStatusNotificationRequest.Recipient(1L, 2L, "user@test.com"))
        );

        service.sendFlightStatusNotifications(req);

        verify(repo, atLeastOnce()).save(any());
    }

    // ================= ADMIN =================

    @Test
    void sendAdminNotificationsSuccess() {
        when(repo.save(any())).thenAnswer(i -> i.getArgument(0));

        AdminNotificationDispatchRequest req = new AdminNotificationDispatchRequest(
                "Sub",
                "Msg",
                "BOOKING_CONFIRMATION",
                List.of(new AdminNotificationRecipientRequest(1L, "user@test.com"))
        );

        service.sendAdminNotifications(req);

        verify(emailService).sendGenericEmail(anyString(), anyString(), anyString());
    }

    @Test
    void sendAdminNotificationsFailure() {
        when(repo.save(any())).thenAnswer(i -> i.getArgument(0));

        doThrow(new RuntimeException()).when(emailService)
                .sendGenericEmail(anyString(), anyString(), anyString());

        AdminNotificationDispatchRequest req = new AdminNotificationDispatchRequest(
                "Sub",
                "Msg",
                "BOOKING_CONFIRMATION",
                List.of(new AdminNotificationRecipientRequest(1L, "user@test.com"))
        );

        service.sendAdminNotifications(req);

        verify(repo, atLeastOnce()).save(any());
    }

    // ================= HELPER =================

    private Notification baseNotification(Notification.Channel channel) {
        Notification n = new Notification();
        n.setId(1L);
        n.setChannel(channel);
        n.setRecipient("user@test.com");
        n.setSubject("Sub");
        n.setMessage("Msg");

        // default type to avoid null branches
        n.setType(Notification.NotificationType.BOOKING_CONFIRMATION);

        return n;
    }
}
