package com.skyBooker.passenger;

import com.skyBooker.passenger.config.WebConfig;
import com.skyBooker.passenger.dto.PassengerRequest;
import com.skyBooker.passenger.dto.PassengerResponse;
import com.skyBooker.passenger.dto.remote.RemoteBookingResponse;
import com.skyBooker.passenger.entity.Passenger;
import com.skyBooker.passenger.validation.PassengerValidationPatterns;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.springframework.boot.SpringApplication;
import org.springframework.web.client.RestTemplate;

import java.lang.reflect.Method;
import java.lang.reflect.Constructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mockStatic;

class PassengerSupportClassesTest {

    @Test
    void passengerEntityLifecycleMethodsManageTimestamps() throws Exception {
        Passenger passenger = new Passenger();
        Method onCreate = Passenger.class.getDeclaredMethod("onCreate");
        Method onUpdate = Passenger.class.getDeclaredMethod("onUpdate");
        onCreate.setAccessible(true);
        onUpdate.setAccessible(true);

        onCreate.invoke(passenger);
        LocalDateTime createdAt = passenger.getCreatedAt();
        LocalDateTime updatedAt = passenger.getUpdatedAt();

        onUpdate.invoke(passenger);

        assertThat(createdAt).isNotNull();
        assertThat(updatedAt).isNotNull();
        assertThat(passenger.getUpdatedAt()).isNotNull();
        assertThat(passenger.getUpdatedAt()).isAfterOrEqualTo(updatedAt);
    }

    @Test
    void passengerRequestAndResponseConstructorsExposeFields() {
        LocalDate dateOfBirth = LocalDate.of(2000, 1, 1);
        LocalDateTime createdAt = LocalDateTime.now().minusDays(1);
        LocalDateTime updatedAt = LocalDateTime.now();

        PassengerRequest request = new PassengerRequest(
                5L,
                "John",
                "Doe",
                "john@example.com",
                "9876543210",
                "AB123456",
                dateOfBirth,
                Passenger.Category.ADULT,
                Passenger.Gender.MALE,
                "Indian",
                "Meal"
        );
        PassengerResponse response = new PassengerResponse(
                1L,
                5L,
                "John",
                "Doe",
                "john@example.com",
                "9876543210",
                "AB123456",
                dateOfBirth,
                Passenger.Category.ADULT,
                Passenger.Gender.MALE,
                "Indian",
                "Meal",
                createdAt,
                updatedAt
        );

        assertThat(request.getBookingId()).isEqualTo(5L);
        assertThat(request.getPassportNumber()).isEqualTo("AB123456");
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getCreatedAt()).isEqualTo(createdAt);
    }

    @Test
    void remoteBookingResponseStoresFields() {
        RemoteBookingResponse response = new RemoteBookingResponse();
        response.setId(10L);
        response.setUserId(25L);

        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getUserId()).isEqualTo(25L);
    }

    @Test
    void webConfigCreatesRestTemplateBean() {
        RestTemplate restTemplate = new WebConfig().restTemplate();

        assertThat(restTemplate).isNotNull();
    }

    @Test
    void applicationMainDelegatesToSpringApplicationRun() {
        try (MockedStatic<SpringApplication> springApplication = mockStatic(SpringApplication.class)) {
            PassengerServiceApplication.main(new String[]{"--spring.main.web-application-type=none"});

            springApplication.verify(() -> SpringApplication.run(PassengerServiceApplication.class, new String[]{"--spring.main.web-application-type=none"}));
        }
    }

    @Test
    void validationPatternsExposeConstantsAndPrivateConstructor() throws Exception {
        Constructor<PassengerValidationPatterns> constructor = PassengerValidationPatterns.class.getDeclaredConstructor();
        constructor.setAccessible(true);
        PassengerValidationPatterns instance = constructor.newInstance();

        assertThat(instance).isNotNull();
        assertThat(PassengerValidationPatterns.NAME).isNotBlank();
        assertThat(PassengerValidationPatterns.PASSPORT).isNotBlank();
        assertThat(PassengerValidationPatterns.NATIONALITY).isNotBlank();
        assertThat(PassengerValidationPatterns.SPECIAL_REQUESTS).isNotBlank();
    }
}
