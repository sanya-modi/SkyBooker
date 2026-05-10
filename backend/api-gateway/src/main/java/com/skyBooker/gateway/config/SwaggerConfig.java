package com.skyBooker.gateway.config;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public GroupedOpenApi authApi() {
        return GroupedOpenApi.builder()
                .group("auth-service")
                .pathsToMatch("/auth/**")
                .build();
    }

    @Bean
    public GroupedOpenApi flightApi() {
        return GroupedOpenApi.builder()
                .group("flight-service")
                .pathsToMatch("/flights/**")
                .build();
    }

    @Bean
    public GroupedOpenApi seatApi() {
        return GroupedOpenApi.builder()
                .group("seat-service")
                .pathsToMatch("/seats/**")
                .build();
    }

    @Bean
    public GroupedOpenApi bookingApi() {
        return GroupedOpenApi.builder()
                .group("booking-service")
                .pathsToMatch("/bookings/**", "/tickets/**")
                .build();
    }

    @Bean
    public GroupedOpenApi passengerApi() {
        return GroupedOpenApi.builder()
                .group("passenger-service")
                .pathsToMatch("/passengers/**")
                .build();
    }

    @Bean
    public GroupedOpenApi paymentApi() {
        return GroupedOpenApi.builder()
                .group("payment-service")
                .pathsToMatch("/payments/**")
                .build();
    }

    @Bean
    public GroupedOpenApi notificationApi() {
        return GroupedOpenApi.builder()
                .group("notification-service")
                .pathsToMatch("/notifications/**")
                .build();
    }

    @Bean
    public GroupedOpenApi airlineAirportApi() {
        return GroupedOpenApi.builder()
                .group("airline-airport-service")
                .pathsToMatch("/airlines/**", "/airports/**")
                .build();
    }

    @Bean
    public GroupedOpenApi adminApi() {
        return GroupedOpenApi.builder()
                .group("admin-user-service")
                .pathsToMatch("/admin/**")
                .build();
    }
}
