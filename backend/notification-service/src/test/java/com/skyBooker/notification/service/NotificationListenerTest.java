package com.skyBooker.notification.service;

import org.junit.jupiter.api.Test;

import java.util.Base64;
import java.util.Map;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class NotificationListenerTest {

    private final EmailService emailService = mock(EmailService.class);
    private final NotificationListener listener = new NotificationListener(emailService);

    @Test
    void handleSignupEventDelegatesToWelcomeEmail() {
        listener.handleSignupEvent(Map.of("email", "user@test.com", "firstName", "John", "lastName", "Doe"));

        verify(emailService).sendWelcomeEmail("user@test.com", "John", "Doe");
    }

    @Test
    void handleLoginEventUsesParsedLoginTime() {
        listener.handleLoginEvent(Map.of(
                "email", "user@test.com",
                "firstName", "John",
                "loginTime", "2026-05-06T10:15:30",
                "ipAddress", "127.0.0.1",
                "device", "Chrome"
        ));

        verify(emailService).sendLoginNotification(org.mockito.ArgumentMatchers.eq("user@test.com"), org.mockito.ArgumentMatchers.eq("John"),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.eq("127.0.0.1"), org.mockito.ArgumentMatchers.eq("Chrome"));
    }

    @Test
    void handleLoginEventFallsBackWhenLoginTimeInvalid() {
        listener.handleLoginEvent(Map.of(
                "email", "user@test.com",
                "firstName", "John",
                "loginTime", "bad",
                "ipAddress", "127.0.0.1",
                "device", "Chrome"
        ));

        verify(emailService).sendLoginNotification(org.mockito.ArgumentMatchers.eq("user@test.com"), org.mockito.ArgumentMatchers.eq("John"),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.eq("127.0.0.1"), org.mockito.ArgumentMatchers.eq("Chrome"));
    }

    @Test
    void handleBookingEventUsesRawByteArray() {
        byte[] pdf = new byte[] {1, 2, 3};
        listener.handleBookingEvent(Map.of(
                "email", "user@test.com",
                "pnr", "PNR123",
                "bookingDetails", Map.of("flightNumber", "SB101"),
                "ticketPdf", pdf
        ));

        verify(emailService).sendBookingConfirmation("user@test.com", "PNR123", Map.of("flightNumber", "SB101"), pdf);
    }

    @Test
    void handleBookingEventDecodesBase64Pdf() {
        String encoded = Base64.getEncoder().encodeToString(new byte[] {4, 5});
        listener.handleBookingEvent(Map.of(
                "email", "user@test.com",
                "pnr", "PNR123",
                "bookingDetails", Map.of(),
                "ticketPdf", encoded
        ));

        verify(emailService).sendBookingConfirmation("user@test.com", "PNR123", Map.of(), new byte[] {4, 5});
    }

    @Test
    void handlePasswordResetEventDelegatesToEmailService() {
        listener.handlePasswordResetEvent(Map.of("email", "user@test.com", "firstName", "John", "resetToken", "token"));

        verify(emailService).sendPasswordResetEmail("user@test.com", "John", "token");
    }

    @Test
    void handlePasswordResetSuccessEventDelegatesToEmailService() {
        listener.handlePasswordResetSuccessEvent(Map.of("email", "user@test.com", "firstName", "John"));

        verify(emailService).sendPasswordResetSuccessEmail("user@test.com", "John");
    }
}
