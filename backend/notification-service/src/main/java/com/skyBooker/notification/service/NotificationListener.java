package com.skyBooker.notification.service;

import com.skyBooker.notification.config.RabbitMQConfig;
import com.skyBooker.notification.dto.BookingEvent;
import com.skyBooker.notification.dto.LoginEvent;
import com.skyBooker.notification.dto.SignupEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationListener {

    private final EmailService emailService;

    @RabbitListener(queues = RabbitMQConfig.SIGNUP_QUEUE)
    public void handleSignupEvent(java.util.Map<String, Object> event) {
        log.info("Received signup event for: {}", event.get("email"));
        emailService.sendWelcomeEmail(
            (String) event.get("email"),
            (String) event.get("firstName"),
            (String) event.get("lastName")
        );
    }

    @RabbitListener(queues = RabbitMQConfig.LOGIN_QUEUE)
    public void handleLoginEvent(java.util.Map<String, Object> event) {
        log.info("Received login event for: {}", event.get("email"));
        
        java.time.LocalDateTime loginTime = java.time.LocalDateTime.now();
        if (event.get("loginTime") != null) {
            try {
                loginTime = java.time.LocalDateTime.parse((String) event.get("loginTime"));
            } catch (Exception e) {
                log.warn("Failed to parse loginTime: {}", event.get("loginTime"));
            }
        }

        emailService.sendLoginNotification(
            (String) event.get("email"),
            (String) event.get("firstName"),
            loginTime,
            (String) event.get("ipAddress"),
            (String) event.get("device")
        );
    }

    @RabbitListener(queues = RabbitMQConfig.BOOKING_QUEUE)
    public void handleBookingEvent(java.util.Map<String, Object> event) {
        log.info("Received booking event for: {}", event.get("email"));
        
        // Handle potential base64 encoded ticketPdf or raw byte array
        byte[] ticketPdf = null;
        Object pdfObj = event.get("ticketPdf");
        if (pdfObj instanceof byte[]) {
            ticketPdf = (byte[]) pdfObj;
        } else if (pdfObj instanceof String) {
            ticketPdf = java.util.Base64.getDecoder().decode((String) pdfObj);
        }

        emailService.sendBookingConfirmation(
            (String) event.get("email"),
            (String) event.get("pnr"),
            (java.util.Map<String, Object>) event.get("bookingDetails"),
            ticketPdf
        );
    }

    @RabbitListener(queues = RabbitMQConfig.PASSWORD_RESET_QUEUE)
    public void handlePasswordResetEvent(java.util.Map<String, Object> event) {
        log.info("Received password reset event for: {}", event.get("email"));
        emailService.sendPasswordResetEmail(
            (String) event.get("email"),
            (String) event.get("firstName"),
            (String) event.get("resetToken")
        );
    }

    @RabbitListener(queues = RabbitMQConfig.PASSWORD_RESET_SUCCESS_QUEUE)
    public void handlePasswordResetSuccessEvent(java.util.Map<String, Object> event) {
        log.info("Received password reset success event for: {}", event.get("email"));
        emailService.sendPasswordResetSuccessEmail(
            (String) event.get("email"),
            (String) event.get("firstName")
        );
    }
}
