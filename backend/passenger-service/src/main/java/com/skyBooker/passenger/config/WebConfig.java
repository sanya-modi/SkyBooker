package com.skyBooker.passenger.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class WebConfig {
    // CORS is handled by API Gateway

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
