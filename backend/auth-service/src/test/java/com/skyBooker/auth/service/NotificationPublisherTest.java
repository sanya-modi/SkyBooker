package com.skyBooker.auth.service;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

class NotificationPublisherTest {

    private final RabbitTemplate rabbitTemplate = mock(RabbitTemplate.class);
    private final NotificationPublisher publisher = new NotificationPublisher(rabbitTemplate);

    @Test
    void publishSignupEventSendsExpectedMessage() {
        publisher.publishSignupEvent("john@test.com", "John", "Doe");

        assertSent("notification.signup", "john@test.com", "John");
    }

    @Test
    void publishLoginEventSendsExpectedMessage() {
        publisher.publishLoginEvent("john@test.com", "John", "127.0.0.1", "Chrome");

        ArgumentCaptor<Map<String, Object>> captor = ArgumentCaptor.forClass(Map.class);
        verify(rabbitTemplate).convertAndSend(eq("notification.exchange"), eq("notification.login"), captor.capture());
        assertThat(captor.getValue()).containsEntry("email", "john@test.com");
        assertThat(captor.getValue()).containsEntry("firstName", "John");
        assertThat(captor.getValue()).containsEntry("ipAddress", "127.0.0.1");
        assertThat(captor.getValue()).containsEntry("device", "Chrome");
        assertThat(captor.getValue()).containsKey("loginTime");
    }

    @Test
    void publishPasswordResetEventSendsExpectedMessage() {
        publisher.publishPasswordResetEvent("john@test.com", "John", "reset-token");

        ArgumentCaptor<Map<String, Object>> captor = ArgumentCaptor.forClass(Map.class);
        verify(rabbitTemplate).convertAndSend(eq("notification.exchange"), eq("notification.password.reset"), captor.capture());
        assertThat(captor.getValue()).containsEntry("resetToken", "reset-token");
    }

    @Test
    void publishPasswordResetSuccessEventSendsExpectedMessage() {
        publisher.publishPasswordResetSuccessEvent("john@test.com", "John");

        assertSent("notification.password.reset.success", "john@test.com", "John");
    }

    @Test
    void publisherSwallowsBrokerExceptions() {
        doThrow(new RuntimeException("broker down")).when(rabbitTemplate)
                .convertAndSend(eq("notification.exchange"), any(), any(Map.class));

        publisher.publishSignupEvent("john@test.com", "John", "Doe");
        publisher.publishLoginEvent("john@test.com", "John", "127.0.0.1", "Chrome");
        publisher.publishPasswordResetEvent("john@test.com", "John", "reset-token");
        publisher.publishPasswordResetSuccessEvent("john@test.com", "John");

        verify(rabbitTemplate, times(4)).convertAndSend(eq("notification.exchange"), any(), any(Map.class));
    }

    @SuppressWarnings("unchecked")
    private void assertSent(String routingKey, String email, String firstName) {
        ArgumentCaptor<Map<String, Object>> captor = ArgumentCaptor.forClass(Map.class);
        verify(rabbitTemplate).convertAndSend(eq("notification.exchange"), eq(routingKey), captor.capture());
        assertThat(captor.getValue()).containsEntry("email", email);
        assertThat(captor.getValue()).containsEntry("firstName", firstName);
    }
}
