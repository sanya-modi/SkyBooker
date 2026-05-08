package com.skybooker.airlineairport;

import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.springframework.boot.SpringApplication;

import static org.mockito.Mockito.mockStatic;

class AirlineAirportApplicationTest {

    @Test
    void mainDelegatesToSpringApplicationRun() {
        String[] args = {"--spring.main.web-application-type=none"};

        try (MockedStatic<SpringApplication> springApplication = mockStatic(SpringApplication.class)) {
            AirlineAirportApplication.main(args);

            springApplication.verify(() -> SpringApplication.run(AirlineAirportApplication.class, args));
        }
    }
}
