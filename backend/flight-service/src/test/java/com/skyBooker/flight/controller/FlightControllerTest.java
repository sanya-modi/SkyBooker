package com.skyBooker.flight.controller;

import com.skyBooker.flight.dto.*;
import com.skyBooker.flight.entity.Flight;
import com.skyBooker.flight.service.FlightService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class FlightControllerTest {

    private final FlightService flightService = mock(FlightService.class);
    private final FlightController controller = new FlightController(flightService);

    @Test
    void createFlightReturnsCreatedResponse() {
        FlightRequest request = sampleRequest();
        FlightResponse responseBody = sampleResponse();
        when(flightService.createFlight(request)).thenReturn(responseBody);

        ResponseEntity<FlightResponse> response = controller.createFlight(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(responseBody);
    }

    @Test
    void getFlightByIdReturnsOk() {
        when(flightService.getFlightById(1L)).thenReturn(sampleResponse());

        ResponseEntity<FlightResponse> response = controller.getFlightById(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getFlightNumber()).isEqualTo("SB101");
    }

    @Test
    void updateFlightReturnsOk() {
        when(flightService.updateFlight(1L, sampleRequest())).thenReturn(sampleResponse());

        ResponseEntity<FlightResponse> response = controller.updateFlight(1L, sampleRequest());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getStatus()).isEqualTo("ON_TIME");
    }

    @Test
    void updateFlightStatusReturnsOk() {
        when(flightService.updateFlightStatus(1L, Flight.FlightStatus.DELAYED)).thenReturn(sampleResponse());

        ResponseEntity<FlightResponse> response = controller.updateFlightStatus(1L, Flight.FlightStatus.DELAYED);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    void deleteFlightReturnsNoContent() {
        ResponseEntity<Void> response = controller.deleteFlight(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(flightService).deleteFlight(1L);
    }

    @Test
    void getAllFlightsUsesDateBranchWhenProvided() {
        when(flightService.getFlightsByDate(LocalDate.of(2026, 1, 1))).thenReturn(List.of(sampleResponse()));

        ResponseEntity<List<FlightResponse>> response = controller.getAllFlights(LocalDate.of(2026, 1, 1), null, null, null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void getAllFlightsUsesUserBranchWhenDateMissing() {
        when(flightService.getFlightsForUser("user@test.com", "PASSENGER", 2L)).thenReturn(List.of(sampleResponse()));

        ResponseEntity<List<FlightResponse>> response = controller.getAllFlights(null, 2L, "user@test.com", "PASSENGER");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void getFlightPassengersReturnsOk() {
        when(flightService.getFlightPassengers(1L)).thenReturn(List.of(sampleManifest()));

        ResponseEntity<List<FlightPassengerManifestResponse>> response = controller.getFlightPassengers(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).singleElement().extracting(FlightPassengerManifestResponse::getName).isEqualTo("John Doe");
    }

    @Test
    void searchFlightsReturnsOk() {
        LocalDateTime departureDate = LocalDateTime.of(2026, 1, 1, 10, 0);
        when(flightService.searchFlights(3L, 4L, departureDate)).thenReturn(List.of(sampleResponse()));

        ResponseEntity<List<FlightResponse>> response = controller.searchFlights(3L, 4L, departureDate);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void searchWithFiltersReturnsOk() {
        FlightSearchFilterDTO filter = new FlightSearchFilterDTO();
        when(flightService.searchWithFilters(filter)).thenReturn(List.of(sampleResponse()));

        ResponseEntity<List<FlightResponse>> response = controller.searchWithFilters(filter);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void getFlightsByAirlineIdReturnsOk() {
        when(flightService.getFlightsByAirlineId(2L)).thenReturn(List.of(sampleResponse()));

        ResponseEntity<List<FlightResponse>> response = controller.getFlightsByAirlineId(2L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void getOnTimeFlightsByAirlineIdReturnsOk() {
        when(flightService.getOnTimeFlightsByAirlineId(2L)).thenReturn(List.of(sampleResponse()));

        ResponseEntity<List<FlightResponse>> response = controller.getOnTimeFlightsByAirlineId(2L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void updateAvailableSeatsReturnsOk() {
        when(flightService.updateAvailableSeats(1L, 3)).thenReturn(true);

        ResponseEntity<Boolean> response = controller.updateAvailableSeats(1L, 3);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isTrue();
    }

    @Test
    void setAvailableSeatsReturnsOk() {
        ResponseEntity<Void> response = controller.setAvailableSeats(1L, 77);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(flightService).setAvailableSeats(1L, 77);
    }

    @Test
    void getSeatConfigReturnsOk() {
        when(flightService.getSeatConfig(1L, "staff@test.com", "AIRLINE_STAFF")).thenReturn(List.of(new SeatClassConfigResponse()));

        ResponseEntity<List<SeatClassConfigResponse>> response = controller.getSeatConfig(1L, "staff@test.com", "AIRLINE_STAFF");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void saveSeatConfigReturnsCreated() {
        SeatConfigRequest request = new SeatConfigRequest();
        when(flightService.saveSeatConfig(1L, request, "staff@test.com", "AIRLINE_STAFF")).thenReturn(List.of(new SeatClassConfigResponse()));

        ResponseEntity<List<SeatClassConfigResponse>> response = controller.saveSeatConfig(1L, request, "staff@test.com", "AIRLINE_STAFF");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void getPopularDestinationsReturnsOk() {
        when(flightService.getPopularDestinations()).thenReturn(List.of(new PopularDestinationResponse("Delhi", "DEL", "img")));

        ResponseEntity<List<PopularDestinationResponse>> response = controller.getPopularDestinations();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).singleElement().extracting(PopularDestinationResponse::getAirportCode).isEqualTo("DEL");
    }

    @Test
    void getFlightsByDestinationReturnsOk() {
        when(flightService.getFlightsByDestination("DEL")).thenReturn(List.of(sampleResponse()));

        ResponseEntity<List<FlightResponse>> response = controller.getFlightsByDestination("DEL");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    private FlightRequest sampleRequest() {
        FlightRequest request = new FlightRequest();
        request.setFlightNumber("SB101");
        request.setAircraftType("A320");
        request.setAirlineId(2L);
        request.setDepartureAirportId(3L);
        request.setArrivalAirportId(4L);
        request.setDepartureTime(LocalDateTime.of(2026, 1, 1, 10, 0));
        request.setArrivalTime(LocalDateTime.of(2026, 1, 1, 12, 0));
        request.setTotalSeats(180);
        request.setBaseFare(new BigDecimal("5000"));
        return request;
    }

    private FlightResponse sampleResponse() {
        return new FlightResponse(
                1L,
                "SB101",
                "A320",
                2L,
                3L,
                4L,
                LocalDateTime.of(2026, 1, 1, 10, 0),
                LocalDateTime.of(2026, 1, 1, 12, 0),
                180,
                160,
                new BigDecimal("5000"),
                "ON_TIME"
        );
    }

    private FlightPassengerManifestResponse sampleManifest() {
        return new FlightPassengerManifestResponse(
                10L,
                20L,
                30L,
                "John Doe",
                "john@test.com",
                "9876543210",
                "12A",
                "A1234567",
                false,
                "Jane Doe",
                "jane@test.com",
                "9876543211"
        );
    }
}
