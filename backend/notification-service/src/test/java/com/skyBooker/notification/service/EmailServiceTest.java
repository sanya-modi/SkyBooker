package com.skyBooker.notification.service;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;
import org.thymeleaf.TemplateEngine;

import java.util.Map;
import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private TemplateEngine templateEngine;

    @InjectMocks
    private EmailService emailService;

    @Test
    void sendGenericEmailUsesMailSender() {
        MimeMessage message = new MimeMessage(Session.getInstance(new Properties()));
        ReflectionTestUtils.setField(emailService, "fromEmail", "noreply@test.com");
        when(mailSender.createMimeMessage()).thenReturn(message);

        emailService.sendGenericEmail("user@test.com", "Hello", "Body");

        verify(mailSender).send(message);
    }

    @Test
    void sendBookingConfirmationProcessesTemplateAndSendsMail() {
        MimeMessage message = new MimeMessage(Session.getInstance(new Properties()));
        ReflectionTestUtils.setField(emailService, "fromEmail", "noreply@test.com");
        when(mailSender.createMimeMessage()).thenReturn(message);
        when(templateEngine.process(eq("booking-confirmation"), any())).thenReturn("<html>ok</html>");

        emailService.sendBookingConfirmation("user@test.com", "PNR123", Map.of("flightNumber", "SB101"), new byte[]{1, 2});

        verify(mailSender).send(message);
    }

    @Test
    void sendFlightStatusUpdateThrowsWhenMailSendFails() {
        MimeMessage message = new MimeMessage(Session.getInstance(new Properties()));
        ReflectionTestUtils.setField(emailService, "fromEmail", "noreply@test.com");
        when(mailSender.createMimeMessage()).thenReturn(message);
        org.mockito.Mockito.doThrow(new RuntimeException("smtp down")).when(mailSender).send(message);

        assertThatThrownBy(() -> emailService.sendFlightStatusUpdate("user@test.com", "SB101", "DEL-BOM", "DELAYED", "Late"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Failed to send flight status update email");
    }
}
