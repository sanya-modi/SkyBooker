package com.skyBooker.notification.service;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;
import org.thymeleaf.TemplateEngine;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmailServiceAdditionalTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private TemplateEngine templateEngine;

    @InjectMocks
    private EmailService emailService;

    private MimeMessage message;

    @BeforeEach
    void setup() {
        message = new MimeMessage(Session.getInstance(new Properties()));
        ReflectionTestUtils.setField(emailService, "fromEmail", "noreply@test.com");
        when(mailSender.createMimeMessage()).thenReturn(message);
    }

    @Test
    void sendWelcomeEmailUsesTemplateAndSendsMail() {
        when(templateEngine.process(eq("welcome-email"), any())).thenReturn("<html>welcome</html>");

        emailService.sendWelcomeEmail("user@test.com", "John", "Doe");

        verify(mailSender).send(message);
    }

    @Test
    void sendLoginNotificationUsesTemplateAndSendsMail() {
        when(templateEngine.process(eq("login-notification"), any())).thenReturn("<html>login</html>");

        emailService.sendLoginNotification("user@test.com", "John", LocalDateTime.of(2026, 5, 6, 10, 0), null, null);

        verify(mailSender).send(message);
    }

    @Test
    void sendCheckInReminderUsesTemplateAndSendsMail() {
        when(templateEngine.process(eq("checkin-reminder"), any())).thenReturn("<html>checkin</html>");

        emailService.sendCheckInReminder("user@test.com", "PNR123", Map.of("flightNumber", "SB101"));

        verify(mailSender).send(message);
    }

    @Test
    void sendBookingConfirmationWithoutAttachmentStillSendsMail() {
        when(templateEngine.process(eq("booking-confirmation"), any())).thenReturn("<html>booking</html>");

        emailService.sendBookingConfirmation("user@test.com", "PNR123", Map.of("flightNumber", "SB101"), null);

        verify(mailSender).send(message);
    }

    @Test
    void sendPasswordResetEmailUsesTemplateAndSendsMail() {
        when(templateEngine.process(eq("password-reset"), any())).thenReturn("<html>reset</html>");

        emailService.sendPasswordResetEmail("user@test.com", "John", "token");

        verify(mailSender).send(message);
    }

    @Test
    void sendPasswordResetSuccessEmailUsesTemplateAndSendsMail() {
        when(templateEngine.process(eq("password-reset-success"), any())).thenReturn("<html>done</html>");

        emailService.sendPasswordResetSuccessEmail("user@test.com", "John");

        verify(mailSender).send(message);
    }

    @Test
    void sendFlightStatusUpdateSendsMail() {
        emailService.sendFlightStatusUpdate("user@test.com", "SB101", "DEL-BOM", "BOARDING", "Please proceed to gate 5");

        verify(mailSender).send(message);
    }

    @Test
    void sendGenericEmailThrowsWhenMailSendFails() {
        doThrow(new RuntimeException("smtp down")).when(mailSender).send(message);

        assertThatThrownBy(() -> emailService.sendGenericEmail("user@test.com", "Subject", "Body"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Failed to send generic email");
    }

    @Test
    void sendSupportToHostSendsPlainTextMail() {
        emailService.sendSupportToHost("Help", "Need assistance", "user@test.com", "John Doe");

        verify(mailSender).send(message);
    }

    @Test
    void sendSupportThankYouToUserSendsHtmlMail() {
        emailService.sendSupportThankYouToUser("user@test.com", "John Doe");

        verify(mailSender).send(message);
    }

    @Test
    void sendWelcomeEmailSwallowsMailExceptions() {
        doThrow(new RuntimeException("smtp down")).when(mailSender).send(message);
        when(templateEngine.process(eq("welcome-email"), any())).thenReturn("<html>welcome</html>");

        emailService.sendWelcomeEmail("user@test.com", "John", "Doe");

        verify(mailSender).send(message);
    }

    @Test
    void sendLoginNotificationSwallowsMailExceptions() {
        doThrow(new RuntimeException("smtp down")).when(mailSender).send(message);
        when(templateEngine.process(eq("login-notification"), any())).thenReturn("<html>login</html>");

        assertThatCode(() -> emailService.sendLoginNotification("user@test.com", "John",
                LocalDateTime.of(2026, 5, 6, 10, 0), "127.0.0.1", "Chrome")).doesNotThrowAnyException();
    }

    @Test
    void sendCheckInReminderSwallowsMailExceptions() {
        doThrow(new RuntimeException("smtp down")).when(mailSender).send(message);
        when(templateEngine.process(eq("checkin-reminder"), any())).thenReturn("<html>checkin</html>");

        assertThatCode(() -> emailService.sendCheckInReminder("user@test.com", "PNR123",
                Map.of("flightNumber", "SB101"))).doesNotThrowAnyException();
    }

    @Test
    void sendPasswordResetEmailSwallowsMailExceptions() {
        doThrow(new RuntimeException("smtp down")).when(mailSender).send(message);
        when(templateEngine.process(eq("password-reset"), any())).thenReturn("<html>reset</html>");

        assertThatCode(() -> emailService.sendPasswordResetEmail("user@test.com", "John", "token"))
                .doesNotThrowAnyException();
    }

    @Test
    void sendPasswordResetSuccessEmailSwallowsMailExceptions() {
        doThrow(new RuntimeException("smtp down")).when(mailSender).send(message);
        when(templateEngine.process(eq("password-reset-success"), any())).thenReturn("<html>done</html>");

        assertThatCode(() -> emailService.sendPasswordResetSuccessEmail("user@test.com", "John"))
                .doesNotThrowAnyException();
    }

    @Test
    void sendSupportToHostSwallowsMailExceptions() {
        doThrow(new RuntimeException("smtp down")).when(mailSender).send(message);

        assertThatCode(() -> emailService.sendSupportToHost("Help", "Need assistance", "user@test.com", "John Doe"))
                .doesNotThrowAnyException();
    }

    @Test
    void sendSupportThankYouToUserSwallowsMailExceptions() {
        doThrow(new RuntimeException("smtp down")).when(mailSender).send(message);

        assertThatCode(() -> emailService.sendSupportThankYouToUser("user@test.com", "John Doe"))
                .doesNotThrowAnyException();
    }
}
