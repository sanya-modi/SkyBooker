package com.skyBooker.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationPublisher {

    private static final String EMAIL_KEY = "email";
    private static final String FIRST_NAME_KEY = "firstName";
    private static final String EXCHANGE = "notification.exchange";

    private final RabbitTemplate rabbitTemplate;

    public void publishSignupEvent(String email, String firstName, String lastName) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put(EMAIL_KEY, email);
            event.put(FIRST_NAME_KEY, firstName);
            event.put("lastName", lastName);
            
            rabbitTemplate.convertAndSend(EXCHANGE, "notification.signup", event);
            log.info("Published signup event for: {}", email);
        } catch (Exception e) {
            log.error("Failed to publish signup event", e);
        }
    }

    public void publishLoginEvent(String email, String firstName, String ipAddress, String device) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put(EMAIL_KEY, email);
            event.put(FIRST_NAME_KEY, firstName);
            event.put("loginTime", LocalDateTime.now().toString());
            event.put("ipAddress", ipAddress);
            event.put("device", device);
            
            rabbitTemplate.convertAndSend(EXCHANGE, "notification.login", event);
            log.info("Published login event for: {}", email);
        } catch (Exception e) {
            log.error("Failed to publish login event", e);
        }
    }

    public void publishPasswordResetEvent(String email, String firstName, String token) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put(EMAIL_KEY, email);
            event.put(FIRST_NAME_KEY, firstName);
            event.put("resetToken", token);
            
            rabbitTemplate.convertAndSend(EXCHANGE, "notification.password.reset", event);
            log.info("Published password reset event for: {}", email);
        } catch (Exception e) {
            log.error("Failed to publish password reset event", e);
        }
    }

    public void publishPasswordResetSuccessEvent(String email, String firstName) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put(EMAIL_KEY, email);
            event.put(FIRST_NAME_KEY, firstName);
            
            rabbitTemplate.convertAndSend(EXCHANGE, "notification.password.reset.success", event);
            log.info("Published password reset success event for: {}", email);
        } catch (Exception e) {
            log.error("Failed to publish password reset success event", e);
        }
    }
}
