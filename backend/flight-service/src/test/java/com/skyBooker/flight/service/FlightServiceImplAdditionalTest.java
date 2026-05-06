package com.skyBooker.flight.service;

import com.skyBooker.flight.dto.*;
import com.skyBooker.flight.dto.remote.*;
import com.skyBooker.flight.entity.Flight;
import com.skyBooker.flight.exception.FlightException;
import com.skyBooker.flight.repository.FlightRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FlightServiceImplAdditionalTest {

    @Mock
    private FlightRepository flightRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private FlightServiceImpl service;

    @BeforeEach
    void setup() {
        ReflectionTestUtils.setField(service, "bookingServiceBaseUrl", "http://booking");
        ReflectionTestUtils.setField(service, "passengerServiceBaseUrl", "http://passenger");
        ReflectionTestUtils.setField(service, "authServiceBaseUrl", "http://auth");
        ReflectionTestUtils.setField(service, "notificationServiceBaseUrl", "http://notification");
        ReflectionTestUtils.setField(service, "seatServiceBaseUrl", "http://seat");
        ReflectionTestUtils.setField(service, "airlineAirportServiceBaseUrl", "http://airline-airport");
    }

    @Test
    void createFlightSuccessInitializesSeats() {
        FlightRequest request = sampleRequest();
        Flight saved = sampleFlight();
        saved.setId(99L);
        when(flightRepository.findByFlightNumber("SB101")).thenReturn(Optional.empty());
        when(flightRepository.save(any(Flight.class))).thenReturn(saved);
        when(restTemplate.getForEntity(anyString(), eq(Object.class))).thenReturn(ResponseEntity.ok().build());

        FlightResponse response = service.createFlight(request);

        assertThat(response.getId()).isEqualTo(99L);
        verify(restTemplate).postForEntity(eq("http://seat/seats/initialize"), any(), eq(Void.class));
    }

    @Test
    void createFlightSwallowsSeatInitializationFailure() {
        FlightRequest request = sampleRequest();
        Flight saved = sampleFlight();
        saved.setId(99L);
        when(flightRepository.findByFlightNumber("SB101")).thenReturn(Optional.empty());
        when(flightRepository.save(any(Flight.class))).thenReturn(saved);
        when(restTemplate.getForEntity(anyString(), eq(Object.class))).thenReturn(ResponseEntity.ok().build());
        when(restTemplate.postForEntity(eq("http://seat/seats/initialize"), any(), eq(Void.class)))
                .thenThrow(new RestClientException("seat init failed"));

        FlightResponse response = service.createFlight(request);

        assertThat(response.getFlightNumber()).isEqualTo("SB101");
    }

    @Test
    void getAllFlightsFiltersInactiveFlights() {
        Flight active = sampleFlight();
        Flight inactive = sampleFlight();
        inactive.setId(2L);
        inactive.setAirlineId(9L);
        when(flightRepository.findAll()).thenReturn(List.of(active, inactive));
        when(restTemplate.getForEntity("http://airline-airport/airlines/2/active", Object.class)).thenReturn(ResponseEntity.ok().build());
        when(restTemplate.getForEntity("http://airline-airport/airports/3/active", Object.class)).thenReturn(ResponseEntity.ok().build());
        when(restTemplate.getForEntity("http://airline-airport/airports/4/active", Object.class)).thenReturn(ResponseEntity.ok().build());
        when(restTemplate.getForEntity("http://airline-airport/airlines/9/active", Object.class)).thenThrow(new RestClientException("inactive"));

        List<FlightResponse> flights = service.getAllFlights();

        assertThat(flights).hasSize(1);
        assertThat(flights.get(0).getAirlineId()).isEqualTo(2L);
    }

    @Test
    void getFlightsForAirlineStaffUsesResolvedAirlineId() {
        Flight active = sampleFlight();
        RemoteUserResponse user = new RemoteUserResponse();
        user.setAirlineId(2L);
        when(restTemplate.getForObject("http://auth/auth/users/email/staff@test.com", RemoteUserResponse.class)).thenReturn(user);
        when(flightRepository.findByAirlineId(2L)).thenReturn(List.of(active));
        when(restTemplate.getForEntity("http://airline-airport/airlines/2/active", Object.class)).thenReturn(ResponseEntity.ok().build());
        when(restTemplate.getForEntity("http://airline-airport/airports/3/active", Object.class)).thenReturn(ResponseEntity.ok().build());
        when(restTemplate.getForEntity("http://airline-airport/airports/4/active", Object.class)).thenReturn(ResponseEntity.ok().build());

        List<FlightResponse> flights = service.getFlightsForUser("staff@test.com", "AIRLINE_STAFF", null);

        assertThat(flights).hasSize(1);
        assertThat(flights.get(0).getFlightNumber()).isEqualTo("SB101");
    }

    @Test
    void getFlightsForAirlineStaffWithoutAirlineThrows() {
        when(restTemplate.getForObject("http://auth/auth/users/email/staff@test.com", RemoteUserResponse.class)).thenReturn(null);

        assertThatThrownBy(() -> service.getFlightsForUser("staff@test.com", "AIRLINE_STAFF", null))
                .isInstanceOf(FlightException.class)
                .hasMessage("Airline staff user is not mapped to an airline");
    }

    @Test
    void getFlightsForUserUsesExplicitAirlineIdWhenProvided() {
        when(flightRepository.findByAirlineId(2L)).thenReturn(List.of(sampleFlight()));
        when(restTemplate.getForEntity(anyString(), eq(Object.class))).thenReturn(ResponseEntity.ok().build());

        List<FlightResponse> flights = service.getFlightsForUser(null, "PASSENGER", 2L);

        assertThat(flights).hasSize(1);
    }

    @Test
    void getFlightPassengersBuildsManifestUsingPassengerAndUserInfo() {
        Flight flight = sampleFlight();
        when(flightRepository.findById(1L)).thenReturn(Optional.of(flight));

        RemoteBookingResponse booking = new RemoteBookingResponse();
        booking.setId(10L);
        booking.setUserId(50L);
        booking.setSelectedSeats(List.of("12A"));
        doReturn(new ResponseEntity<>(List.of(booking), HttpStatus.OK))
                .when(restTemplate).exchange(eq("http://booking/bookings/flight/1/confirmed"), eq(HttpMethod.GET), eq(null), any(ParameterizedTypeReference.class));

        RemotePassengerResponse passenger = new RemotePassengerResponse();
        passenger.setId(100L);
        passenger.setFirstName("John");
        passenger.setLastName("Doe");
        passenger.setPassportNumber("A1234567");
        doReturn(new ResponseEntity<>(List.of(passenger), HttpStatus.OK))
                .when(restTemplate).exchange(eq("http://passenger/passengers/booking/10"), eq(HttpMethod.GET), eq(null), any(ParameterizedTypeReference.class));

        RemoteUserResponse user = new RemoteUserResponse();
        user.setFirstName("Jane");
        user.setLastName("Doe");
        user.setEmail("user@test.com");
        user.setPhoneNumber("9876543210");
        user.setIsActive(true);
        when(restTemplate.getForObject("http://auth/auth/users/50", RemoteUserResponse.class)).thenReturn(user);

        List<FlightPassengerManifestResponse> manifest = service.getFlightPassengers(1L);

        assertThat(manifest).hasSize(1);
        assertThat(manifest.get(0).getSeat()).isEqualTo("12A");
        assertThat(manifest.get(0).getName()).isEqualTo("John Doe");
        assertThat(manifest.get(0).getBookedByName()).isEqualTo("Jane Doe");
    }

    @Test
    void updateFlightStatusNotifiesPassengersUsingUserFallbackWhenPassengerEmailsMissing() {
        Flight flight = sampleFlight();
        when(flightRepository.findById(1L)).thenReturn(Optional.of(flight));
        when(flightRepository.save(flight)).thenReturn(flight);

        RemoteBookingResponse booking = new RemoteBookingResponse();
        booking.setId(10L);
        booking.setUserId(50L);
        doReturn(new ResponseEntity<>(List.of(booking), HttpStatus.OK))
                .when(restTemplate).exchange(eq("http://booking/bookings/flight/1/confirmed"), eq(HttpMethod.GET), eq(null), any(ParameterizedTypeReference.class));

        RemotePassengerResponse passenger = new RemotePassengerResponse();
        passenger.setEmail(null);
        doReturn(new ResponseEntity<>(List.of(passenger), HttpStatus.OK))
                .when(restTemplate).exchange(eq("http://passenger/passengers/booking/10"), eq(HttpMethod.GET), eq(null), any(ParameterizedTypeReference.class));

        RemoteUserResponse user = new RemoteUserResponse();
        user.setEmail("fallback@test.com");
        when(restTemplate.getForObject("http://auth/auth/users/50", RemoteUserResponse.class)).thenReturn(user);

        FlightResponse response = service.updateFlightStatus(1L, Flight.FlightStatus.DELAYED);

        assertThat(response.getStatus()).isEqualTo("DELAYED");
        ArgumentCaptor<FlightStatusNotificationRequest> captor = ArgumentCaptor.forClass(FlightStatusNotificationRequest.class);
        verify(restTemplate).postForEntity(eq("http://notification/notifications/flight-status"), captor.capture(), eq(Void.class));
        assertThat(captor.getValue().getRecipients()).singleElement().extracting(FlightStatusNotificationRequest.Recipient::getEmail).isEqualTo("fallback@test.com");
        assertThat(captor.getValue().getMessage()).contains("delayed");
    }

    @Test
    void updateFlightStatusSkipsNotificationWhenNoRecipientsFound() {
        Flight flight = sampleFlight();
        when(flightRepository.findById(1L)).thenReturn(Optional.of(flight));
        when(flightRepository.save(flight)).thenReturn(flight);

        RemoteBookingResponse booking = new RemoteBookingResponse();
        booking.setId(10L);
        booking.setUserId(50L);
        doReturn(new ResponseEntity<>(List.of(booking), HttpStatus.OK))
                .when(restTemplate).exchange(eq("http://booking/bookings/flight/1/confirmed"), eq(HttpMethod.GET), eq(null), any(ParameterizedTypeReference.class));

        RemotePassengerResponse passenger = new RemotePassengerResponse();
        passenger.setEmail("");
        doReturn(new ResponseEntity<>(List.of(passenger), HttpStatus.OK))
                .when(restTemplate).exchange(eq("http://passenger/passengers/booking/10"), eq(HttpMethod.GET), eq(null), any(ParameterizedTypeReference.class));

        RemoteUserResponse user = new RemoteUserResponse();
        user.setEmail("");
        when(restTemplate.getForObject("http://auth/auth/users/50", RemoteUserResponse.class)).thenReturn(user);

        service.updateFlightStatus(1L, Flight.FlightStatus.ARRIVED);

        verify(restTemplate, never()).postForEntity(eq("http://notification/notifications/flight-status"), any(), eq(Void.class));
    }

    @Test
    void saveSeatConfigForAirlineStaffReturnsResponseBody() {
        Flight flight = sampleFlight();
        when(flightRepository.findById(1L)).thenReturn(Optional.of(flight));
        RemoteUserResponse user = new RemoteUserResponse();
        user.setAirlineId(2L);
        when(restTemplate.getForObject("http://auth/auth/users/email/staff@test.com", RemoteUserResponse.class)).thenReturn(user);

        SeatClassConfigResponse config = new SeatClassConfigResponse();
        doReturn(new ResponseEntity<>(List.of(config), HttpStatus.OK))
                .when(restTemplate).exchange(eq("http://seat/seats/flight/1/config"), eq(HttpMethod.POST), any(), any(ParameterizedTypeReference.class));

        List<SeatClassConfigResponse> response = service.saveSeatConfig(1L, new SeatConfigRequest(), "staff@test.com", "AIRLINE_STAFF");

        assertThat(response).hasSize(1);
    }

    @Test
    void getSeatConfigThrowsWhenAirlineStaffHasNoAccess() {
        Flight flight = sampleFlight();
        when(flightRepository.findById(1L)).thenReturn(Optional.of(flight));
        RemoteUserResponse user = new RemoteUserResponse();
        user.setAirlineId(999L);
        when(restTemplate.getForObject("http://auth/auth/users/email/staff@test.com", RemoteUserResponse.class)).thenReturn(user);

        assertThatThrownBy(() -> service.getSeatConfig(1L, "staff@test.com", "AIRLINE_STAFF"))
                .isInstanceOf(FlightException.class)
                .hasMessage("You do not have access to manage this flight");
    }

    @Test
    void getSeatConfigForNonAirlineStaffReturnsEmptyWhenBodyMissing() {
        doReturn(ResponseEntity.<List<SeatClassConfigResponse>>status(HttpStatus.OK).body(null))
                .when(restTemplate).exchange(eq("http://seat/seats/flight/1/config"), eq(HttpMethod.GET), eq(null), any(ParameterizedTypeReference.class));

        List<SeatClassConfigResponse> response = service.getSeatConfig(1L, null, "PASSENGER");

        assertThat(response).isEmpty();
    }

    @Test
    void getPopularDestinationsMapsAirportsAndSkipsFailures() {
        when(flightRepository.findTopDestinationsByBookingCount(PageRequest.of(0, 6))).thenReturn(List.of(1L, 2L));

        RemoteAirportResponse airport = new RemoteAirportResponse();
        airport.setCity("New Delhi");
        airport.setIataCode("DEL");
        when(restTemplate.getForObject("http://airline-airport/airports/1", RemoteAirportResponse.class)).thenReturn(airport);
        when(restTemplate.getForObject("http://airline-airport/airports/2", RemoteAirportResponse.class)).thenThrow(new RestClientException("down"));

        List<PopularDestinationResponse> response = service.getPopularDestinations();

        assertThat(response).singleElement().satisfies(item -> {
            assertThat(item.getDestinationName()).isEqualTo("New Delhi");
            assertThat(item.getAirportCode()).isEqualTo("DEL");
            assertThat(item.getImageUrl()).contains("New+Delhi");
        });
    }

    @Test
    void getFlightsByDestinationReturnsMatchingFlights() {
        RemoteAirportResponse airport = new RemoteAirportResponse();
        airport.setId(5L);
        when(restTemplate.getForObject("http://airline-airport/airports/iata/DEL", RemoteAirportResponse.class)).thenReturn(airport);
        when(flightRepository.findByArrivalAirportId(5L)).thenReturn(List.of(sampleFlight()));

        List<FlightResponse> response = service.getFlightsByDestination("DEL");

        assertThat(response).hasSize(1);
        assertThat(response.get(0).getArrivalAirportId()).isEqualTo(4L);
    }

    @Test
    void searchWithFiltersReturnsMappedFlights() {
        FlightSearchFilterDTO filter = new FlightSearchFilterDTO();
        filter.setDepartureAirportId(3L);
        filter.setArrivalAirportId(4L);
        filter.setDepartureDate(LocalDate.now().plusDays(1));

        when(flightRepository.searchFlights(eq(3L), eq(4L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(sampleFlight()));
        when(restTemplate.getForEntity(anyString(), eq(Object.class))).thenReturn(ResponseEntity.ok().build());

        List<FlightResponse> response = service.searchWithFilters(filter);

        assertThat(response).hasSize(1);
    }

    private Flight sampleFlight() {
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
