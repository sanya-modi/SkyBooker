package com.skyBooker.notification.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String SIGNUP_QUEUE = "signup.queue";
    public static final String LOGIN_QUEUE = "login.queue";
    public static final String BOOKING_QUEUE = "booking.queue";
    public static final String PASSWORD_RESET_QUEUE = "password.reset.queue";
    public static final String PASSWORD_RESET_SUCCESS_QUEUE = "password.reset.success.queue";
    public static final String NOTIFICATION_EXCHANGE = "notification.exchange";

    @Bean
    public Queue signupQueue() {
        return new Queue(SIGNUP_QUEUE, true);
    }

    @Bean
    public Queue loginQueue() {
        return new Queue(LOGIN_QUEUE, true);
    }

    @Bean
    public Queue bookingQueue() {
        return new Queue(BOOKING_QUEUE, true);
    }

    @Bean
    public Queue passwordResetQueue() {
        return new Queue(PASSWORD_RESET_QUEUE, true);
    }

    @Bean
    public Queue passwordResetSuccessQueue() {
        return new Queue(PASSWORD_RESET_SUCCESS_QUEUE, true);
    }

    @Bean
    public TopicExchange notificationExchange() {
        return new TopicExchange(NOTIFICATION_EXCHANGE);
    }

    @Bean
    public Binding signupBinding(Queue signupQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(signupQueue).to(notificationExchange).with("notification.signup");
    }

    @Bean
    public Binding loginBinding(Queue loginQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(loginQueue).to(notificationExchange).with("notification.login");
    }

    @Bean
    public Binding bookingBinding(Queue bookingQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(bookingQueue).to(notificationExchange).with("notification.booking");
    }

    @Bean
    public Binding passwordResetBinding(Queue passwordResetQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(passwordResetQueue).to(notificationExchange).with("notification.password.reset");
    }

    @Bean
    public Binding passwordResetSuccessBinding(Queue passwordResetSuccessQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(passwordResetSuccessQueue).to(notificationExchange).with("notification.password.reset.success");
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }
}
