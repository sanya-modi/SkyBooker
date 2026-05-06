package com.skyBooker.admin.config;

import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.assertThat;

class RestTemplateConfigTest {

    @Test
    void beanCreation() {
        RestTemplateConfig config = new RestTemplateConfig();
        RestTemplate template = config.restTemplate();

        assertThat(template).isNotNull();
    }
}