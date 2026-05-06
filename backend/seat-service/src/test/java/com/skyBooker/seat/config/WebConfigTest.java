package com.skyBooker.seat.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Web Configuration Tests")
class WebConfigTest {

    @Test
    void webConfigLoads() {
        WebConfig config = new WebConfig();
        assertThat(config).isNotNull();
    }

    @Test
    void webConfigIsAnnotatedWithConfiguration() {
        assertThat(WebConfig.class.isAnnotationPresent(org.springframework.context.annotation.Configuration.class))
                .isTrue();
    }
}