package com.skyBooker.flight.service;

import com.skyBooker.flight.dto.FlightRequest;
import com.skyBooker.flight.dto.FlightResponse;
import com.skyBooker.flight.entity.Flight;
import com.skyBooker.flight.exception.FlightException;
import com.skyBooker.flight.repository.FlightRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FlightServiceImplTest {

    @Mock
    private FlightRepository flightRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private FlightServiceImpl service;

    // 🔥 IMPORTANT: Fix null base URL issue
    @BeforeEach
    void setup() {
        ReflectionTestUtils.setField(service, "bookingServiceBaseUrl", "http://booking");
    }

    // ================= BASIC =================

    @Test
    void getFlightByIdSuccess() {
        when(flightRepository.findById(1L)).thenReturn(Optional.of(sample()));

        FlightResponse res = service.getFlightById(1L);

        assertThat(res.getFlightNumber()).isEqualTo("SB101");
    }

    @Test
    void getFlightByIdThrows() {
        when(flightRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getFlightById(1L))
                .isInstanceOf(FlightException.class);
    }

    // ================= CREATE =================

    @Test
    void createFlightDuplicateThrows() {
        FlightRequest req = sampleRequest();

        when(flightRepository.findByFlightNumber("SB101"))
                .thenReturn(Optional.of(new Flight()));

        assertThatThrownBy(() -> service.createFlight(req))
                .isInstanceOf(FlightException.class);
    }

    @Test
    void createFlightInvalidTimeThrows() {
        FlightRequest req = sampleRequest();
        req.setArrivalTime(req.getDepartureTime().minusHours(1));

        when(flightRepository.findByFlightNumber("SB101")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.createFlight(req))
                .isInstanceOf(FlightException.class);
    }

    // ================= UPDATE =================

    @Test
    void updateFlightSuccess() {
        Flight existing = sample();

        when(flightRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(flightRepository.save(existing)).thenReturn(existing);

        FlightResponse res = service.updateFlight(1L, sampleRequest());

        assertThat(res.getFlightNumber()).isEqualTo("SB101");
    }

    @Test
    void updateFlightDuplicateThrows() {
        Flight existing = sample();

        when(flightRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(flightRepository.findByFlightNumber("NEW")).thenReturn(Optional.of(new Flight()));

        FlightRequest req = sampleRequest();
        req.setFlightNumber("NEW");

        assertThatThrownBy(() -> service.updateFlight(1L, req))
                .isInstanceOf(FlightException.class);
    }

    // ================= DELETE =================

    @Test
    void deleteFlightMarksCancelled() {
        Flight flight = sample();

        when(flightRepository.findById(1L)).thenReturn(Optional.of(flight));

        service.deleteFlight(1L);

        assertThat(flight.getStatus()).isEqualTo(Flight.FlightStatus.CANCELLED);
        verify(flightRepository).save(flight);
    }

    // ================= SEATS =================

    @Test
    void updateAvailableSeatsSuccess() {
        when(flightRepository.findById(1L)).thenReturn(Optional.of(sample()));

        assertThat(service.updateAvailableSeats(1L, 5)).isTrue();
    }

    @Test
    void updateAvailableSeatsFail() {
        Flight flight = sample();
        flight.setAvailableSeats(1);

        when(flightRepository.findById(1L)).thenReturn(Optional.of(flight));

        assertThat(service.updateAvailableSeats(1L, 2)).isFalse();
    }

    @Test
    void setAvailableSeats() {
        Flight flight = sample();

        when(flightRepository.findById(1L)).thenReturn(Optional.of(flight));

        service.setAvailableSeats(1L, 50);

        assertThat(flight.getAvailableSeats()).isEqualTo(50);
        verify(flightRepository).save(flight);
    }

    // ================= LIST =================

    @Test
    void getAllFlights() {
        when(flightRepository.findAll()).thenReturn(List.of(sample()));

        assertThat(service.getAllFlights()).hasSize(1);
    }

    @Test
    void getFlightsByDate() {
        when(flightRepository.findByDepartureTimeBetweenOrderByDepartureTimeAsc(any(), any()))
                .thenReturn(List.of(sample()));

        assertThat(service.getFlightsByDate(LocalDate.now())).hasSize(1);
    }

    @Test
    void getFlightsByAirline() {
        when(flightRepository.findByAirlineId(2L)).thenReturn(List.of(sample()));

        assertThat(service.getFlightsByAirlineId(2L)).hasSize(1);
    }

    @Test
    void searchFlights() {
        when(flightRepository.findAvailableFlights(any(), any(), any()))
                .thenReturn(List.of(sample()));

        assertThat(service.searchFlights(1L, 2L, LocalDateTime.now())).hasSize(1);
    }

    // ================= DESTINATION =================

    @Test
    void getFlightsByDestinationHandlesException() {
        when(restTemplate.getForObject(anyString(), any()))
                .thenThrow(new RuntimeException());

        assertThat(service.getFlightsByDestination("DEL")).isEmpty();
    }

    // ================= STATUS =================

    @Test
    void updateFlightStatus() {
        Flight flight = sample();

        when(flightRepository.findById(1L)).thenReturn(Optional.of(flight));
        when(flightRepository.save(flight)).thenReturn(flight);

        // 🔥 FINAL FIX: correct mocking for ParameterizedTypeReference
        doReturn(new ResponseEntity<>(List.of(), HttpStatus.OK))
                .when(restTemplate)
                .exchange(
                        anyString(),
                        any(),
                        any(),
                        any(ParameterizedTypeReference.class)
                );

        FlightResponse res = service.updateFlightStatus(1L, Flight.FlightStatus.DELAYED);

        assertThat(res.getStatus()).isEqualTo("DELAYED");
    }

    // ================= HELPER =================

    private Flight sample() {
        Flight f = new Flight();
        f.setId(1L);
        f.setFlightNumber("SB101");
        f.setAircraftType("A320");
        f.setAirlineId(2L);
        f.setDepartureAirportId(3L);
        f.setArrivalAirportId(4L);
        f.setDepartureTime(LocalDateTime.now().plusHours(2));
        f.setArrivalTime(LocalDateTime.now().plusHours(4));
        f.setTotalSeats(100);
        f.setAvailableSeats(90);
        f.setBaseFare(new BigDecimal("5000"));
        f.setStatus(Flight.FlightStatus.ON_TIME);
        return f;
    }

    private FlightRequest sampleRequest() {
        FlightRequest r = new FlightRequest();
        r.setFlightNumber("SB101");
        r.setAircraftType("A320");
        r.setAirlineId(2L);
        r.setDepartureAirportId(3L);
        r.setArrivalAirportId(4L);
        r.setDepartureTime(LocalDateTime.now().plusHours(2));
        r.setArrivalTime(LocalDateTime.now().plusHours(4));
        r.setTotalSeats(100);
        r.setBaseFare(new BigDecimal("5000"));
        return r;
    }
}