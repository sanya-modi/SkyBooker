package com.skyBooker.admin;

import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.springframework.boot.SpringApplication;

import static org.mockito.Mockito.mockStatic;

class AdminServiceApplicationTest {

    @Test
    void mainDelegatesToSpringApplicationRun() {
        String[] args = {"--spring.main.web-application-type=none"};

        try (MockedStatic<SpringApplication> springApplication = mockStatic(SpringApplication.class)) {
            AdminServiceApplication.main(args);

            springApplication.verify(() -> SpringApplication.run(AdminServiceApplication.class, args));
        }
    }
}
