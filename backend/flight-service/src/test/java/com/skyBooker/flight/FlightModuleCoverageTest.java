package com.skyBooker.flight;

import com.skyBooker.flight.config.GlobalExceptionHandler;
import com.skyBooker.flight.config.SeedDataConfig;
import com.skyBooker.flight.config.WebConfig;
import com.skyBooker.flight.entity.Flight;
import com.skyBooker.flight.exception.FlightException;
import com.skyBooker.flight.repository.FlightRepository;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.WebRequest;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class FlightModuleCoverageTest {

    @Test
    void applicationMainIsCovered() {
        String[] args = {"--spring.main.web-application-type=none"};

        try (MockedStatic<SpringApplication> springApplication = mockStatic(SpringApplication.class)) {
            FlightServiceApplication.main(args);

            springApplication.verify(() -> SpringApplication.run(FlightServiceApplication.class, args));
        }
    }

    @Test
    void webConfigCreatesRestTemplate() {
        RestTemplate restTemplate = new WebConfig().restTemplate();
        assertThat(restTemplate).isNotNull();
    }

    @Test
    void seedDataConfigSeedsWhenRepositoryIsEmptyAndSkipsWhenItIsNot() throws Exception {
        SeedDataConfig seedDataConfig = new SeedDataConfig();
        FlightRepository repository = mock(FlightRepository.class);

        when(repository.count()).thenReturn(0L);
        when(repository.findByFlightNumber(any())).thenReturn(Optional.empty());

        CommandLineRunner runner = invokeSeedFlights(seedDataConfig, repository);
        runner.run();

        verify(repository, times(18)).save(any(Flight.class));

        FlightRepository existingRepository = mock(FlightRepository.class);
        when(existingRepository.count()).thenReturn(1L);

        invokeSeedFlights(seedDataConfig, existingRepository).run();

        verify(existingRepository, never()).save(any(Flight.class));
    }

    @Test
    void globalExceptionHandlerCoversRuntimeValidationIllegalArgumentAndFallback() throws Exception {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        WebRequest request = mock(WebRequest.class);
        when(request.getDescription(false)).thenReturn("uri=/flights");

        ResponseEntity<?> runtime = handler.handleRuntimeException(new RuntimeException("boom"), request);
        assertThat(runtime.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);

        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new DummyBody(), "dummyBody");
        bindingResult.addError(new FieldError("dummyBody", "flightNumber", "required"));
        MethodArgumentNotValidException validationException = new MethodArgumentNotValidException(
                new MethodParameter(DummyController.class.getMethod("submit", DummyBody.class), 0),
                bindingResult
        );

        ResponseEntity<?> validation = handler.handleValidationException(validationException, request);
        assertThat(validation.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat((Map<String, Object>) validation.getBody()).containsEntry("message", "Input validation error");

        ResponseEntity<?> illegalArgument = handler.handleIllegalArgumentException(new IllegalArgumentException("bad input"), request);
        assertThat(illegalArgument.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);

        ResponseEntity<?> fallback = handler.handleGlobalException(new Exception(), request);
        assertThat(fallback.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat((Map<String, Object>) fallback.getBody()).containsEntry("message", "An unexpected error occurred");
    }

    @Test
    void flightEntityLifecycleAndExceptionAreCovered() {
        Flight flight = new Flight();
        flight.setFlightNumber("SB101");
        flight.setAircraftType("A320");
        flight.setAirlineId(2L);
        flight.setDepartureAirportId(3L);
        flight.setArrivalAirportId(4L);
        flight.setDepartureTime(LocalDateTime.now().plusHours(2));
        flight.setArrivalTime(LocalDateTime.now().plusHours(4));
        flight.setTotalSeats(100);
        flight.setAvailableSeats(100);
        flight.setBaseFare(new BigDecimal("5000"));

        ReflectionTestUtils.invokeMethod(flight, "onCreate");
        assertThat(flight.getStatus()).isEqualTo(Flight.FlightStatus.ON_TIME);
        assertThat(flight.getCreatedAt()).isNotNull();

        ReflectionTestUtils.invokeMethod(flight, "onUpdate");
        assertThat(flight.getUpdatedAt()).isNotNull();

        FlightException exception = new FlightException("missing flight", "FLIGHT_NOT_FOUND");
        assertThat(exception).hasMessage("missing flight");
        assertThat(exception.getErrorCode()).isEqualTo("FLIGHT_NOT_FOUND");
    }

    private CommandLineRunner invokeSeedFlights(SeedDataConfig seedDataConfig, FlightRepository repository)
            throws NoSuchMethodException, InvocationTargetException, IllegalAccessException {
        Method method = SeedDataConfig.class.getDeclaredMethod("seedFlights", FlightRepository.class);
        method.setAccessible(true);
        return (CommandLineRunner) method.invoke(seedDataConfig, repository);
    }

    static class DummyController {
        public void submit(DummyBody body) {
        }
    }

    static class DummyBody {
    }
}
