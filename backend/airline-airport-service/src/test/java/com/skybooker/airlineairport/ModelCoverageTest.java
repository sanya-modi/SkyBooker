package com.skyBooker.airlineairport;

import com.skyBooker.airlineairport.dto.AirlineRequest;
import com.skyBooker.airlineairport.dto.AirlineResponse;
import com.skyBooker.airlineairport.dto.AirportRequest;
import com.skyBooker.airlineairport.dto.AirportResponse;
import com.skyBooker.airlineairport.entity.Airline;
import com.skyBooker.airlineairport.entity.Airport;
import com.skyBooker.airlineairport.validation.AirlineAirportValidationPatterns;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class ModelCoverageTest {

    @Test
    void airlineRequestSupportsConstructorsAccessorsAndEquality() {
        AirlineRequest request = new AirlineRequest();
        request.setName("IndiGo");
        request.setIataCode("6E");
        request.setDescription("Budget airline");
        request.setPhoneNumber("9876543210");
        request.setEmail("support@goindigo.in");
        request.setIsActive(true);

        AirlineRequest same = new AirlineRequest("IndiGo", "6E", "Budget airline", "9876543210", "support@goindigo.in", true);

        assertThat(request).isEqualTo(same);
        assertThat(request).hasSameHashCodeAs(same);
        assertThat(request.toString()).contains("IndiGo", "6E");
    }

    @Test
    void airportRequestSupportsConstructorsAccessorsAndEquality() {
        AirportRequest request = new AirportRequest();
        request.setName("Delhi Airport");
        request.setIataCode("DEL");
        request.setCity("Delhi");
        request.setCountry("India");
        request.setDescription("Primary airport");
        request.setPhoneNumber("9876543201");
        request.setEmail("info@del.airport");
        request.setIsActive(true);

        AirportRequest same = new AirportRequest("Delhi Airport", "DEL", "Delhi", "India", "Primary airport", "9876543201", "info@del.airport", true);

        assertThat(request).isEqualTo(same);
        assertThat(request).hasSameHashCodeAs(same);
        assertThat(request.toString()).contains("Delhi Airport", "DEL");
    }

    @Test
    void airlineResponseSupportsConstructorsAccessorsAndEquality() {
        LocalDateTime createdAt = LocalDateTime.of(2024, 1, 1, 10, 0);
        LocalDateTime updatedAt = LocalDateTime.of(2024, 1, 2, 10, 0);

        AirlineResponse response = new AirlineResponse();
        response.setId(1L);
        response.setName("IndiGo");
        response.setIataCode("6E");
        response.setDescription("Budget airline");
        response.setPhoneNumber("9876543210");
        response.setEmail("support@goindigo.in");
        response.setIsActive(true);
        response.setCreatedAt(createdAt);
        response.setUpdatedAt(updatedAt);

        AirlineResponse same = new AirlineResponse(1L, "IndiGo", "6E", "Budget airline", "9876543210", "support@goindigo.in", true, createdAt, updatedAt);

        assertThat(response).isEqualTo(same);
        assertThat(response).hasSameHashCodeAs(same);
        assertThat(response.toString()).contains("IndiGo", "6E");
    }

    @Test
    void airportResponseSupportsConstructorsAccessorsAndEquality() {
        LocalDateTime createdAt = LocalDateTime.of(2024, 1, 1, 10, 0);
        LocalDateTime updatedAt = LocalDateTime.of(2024, 1, 2, 10, 0);

        AirportResponse response = new AirportResponse();
        response.setId(1L);
        response.setName("Delhi Airport");
        response.setIataCode("DEL");
        response.setCity("Delhi");
        response.setCountry("India");
        response.setDescription("Primary airport");
        response.setPhoneNumber("9876543201");
        response.setEmail("info@del.airport");
        response.setIsActive(true);
        response.setCreatedAt(createdAt);
        response.setUpdatedAt(updatedAt);

        AirportResponse same = new AirportResponse(1L, "Delhi Airport", "DEL", "Delhi", "India", "Primary airport", "9876543201", "info@del.airport", true, createdAt, updatedAt);

        assertThat(response).isEqualTo(same);
        assertThat(response).hasSameHashCodeAs(same);
        assertThat(response.toString()).contains("Delhi Airport", "DEL");
    }

    @Test
    void airlineEntityCoversLifecycleAndDataMethods() {
        Airline airline = new Airline();
        airline.setId(1L);
        airline.setName("IndiGo");
        airline.setIataCode("6E");
        airline.setDescription("Budget airline");
        airline.setPhoneNumber("9876543210");
        airline.setEmail("support@goindigo.in");
        airline.setIsActive(true);

        invokeLifecycle(airline, "onCreate");
        LocalDateTime createdAt = airline.getCreatedAt();
        LocalDateTime initialUpdatedAt = airline.getUpdatedAt();

        invokeLifecycle(airline, "onUpdate");

        Airline same = new Airline(1L, "IndiGo", "6E", "Budget airline", "9876543210", "support@goindigo.in", true, createdAt, airline.getUpdatedAt());

        assertThat(createdAt).isNotNull();
        assertThat(initialUpdatedAt).isNotNull();
        assertThat(airline.getUpdatedAt()).isNotNull();
        assertThat(airline).isEqualTo(same);
        assertThat(airline).hasSameHashCodeAs(same);
        assertThat(airline.toString()).contains("IndiGo", "6E");
    }

    @Test
    void airportEntityCoversLifecycleAndDataMethods() {
        Airport airport = new Airport();
        airport.setId(1L);
        airport.setName("Delhi Airport");
        airport.setIataCode("DEL");
        airport.setCity("Delhi");
        airport.setCountry("India");
        airport.setDescription("Primary airport");
        airport.setPhoneNumber("9876543201");
        airport.setEmail("info@del.airport");
        airport.setIsActive(true);

        invokeLifecycle(airport, "onCreate");
        LocalDateTime createdAt = airport.getCreatedAt();
        LocalDateTime initialUpdatedAt = airport.getUpdatedAt();

        invokeLifecycle(airport, "onUpdate");

        Airport same = new Airport(1L, "Delhi Airport", "DEL", "Delhi", "India", "Primary airport", "9876543201", "info@del.airport", true, createdAt, airport.getUpdatedAt());

        assertThat(createdAt).isNotNull();
        assertThat(initialUpdatedAt).isNotNull();
        assertThat(airport.getUpdatedAt()).isNotNull();
        assertThat(airport).isEqualTo(same);
        assertThat(airport).hasSameHashCodeAs(same);
        assertThat(airport.toString()).contains("Delhi Airport", "DEL");
    }

    @Test
    void validationPatternsConstantsAreAvailable() throws NoSuchMethodException, InvocationTargetException, InstantiationException, IllegalAccessException {
        assertThat(AirlineAirportValidationPatterns.NAME).contains("A-Za-z0-9");
        assertThat(AirlineAirportValidationPatterns.IATA_CODE_AIRLINE).isEqualTo("^[A-Z0-9]{2,3}$");
        assertThat(AirlineAirportValidationPatterns.IATA_CODE_AIRPORT).isEqualTo("^[A-Z]{3}$");
        assertThat(AirlineAirportValidationPatterns.CITY_COUNTRY).contains("A-Za-z");
        assertThat(AirlineAirportValidationPatterns.EMAIL).contains("@");
        assertThat(AirlineAirportValidationPatterns.PHONE).contains("14");
        assertThat(AirlineAirportValidationPatterns.DESCRIPTION).contains("500");

        Constructor<AirlineAirportValidationPatterns> constructor = AirlineAirportValidationPatterns.class.getDeclaredConstructor();
        constructor.setAccessible(true);
        AirlineAirportValidationPatterns instance = constructor.newInstance();
        assertThat(instance).isNotNull();
    }

    private void invokeLifecycle(Object target, String methodName) {
        try {
            Method method = target.getClass().getDeclaredMethod(methodName);
            method.setAccessible(true);
            method.invoke(target);
        } catch (ReflectiveOperationException ex) {
            throw new AssertionError(ex);
        }
    }
}
