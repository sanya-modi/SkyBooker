package com.skyBooker.flight.controller;

import com.skyBooker.flight.dto.FlightRequest;
import com.skyBooker.flight.dto.FlightPassengerManifestResponse;
import com.skyBooker.flight.dto.FlightResponse;
import com.skyBooker.flight.dto.FlightSearchFilterDTO;
import com.skyBooker.flight.dto.SeatClassConfigResponse;
import com.skyBooker.flight.dto.SeatConfigRequest;
import com.skyBooker.flight.entity.Flight;
import com.skyBooker.flight.service.FlightService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/flights")
@RequiredArgsConstructor
public class FlightController {

    private final FlightService flightService;

    @PostMapping
    public ResponseEntity<FlightResponse> createFlight(@Valid @RequestBody FlightRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(flightService.createFlight(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlightResponse> getFlightById(@PathVariable Long id) {
        return ResponseEntity.ok(flightService.getFlightById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FlightResponse> updateFlight(@PathVariable Long id, @Valid @RequestBody FlightRequest request) {
        return ResponseEntity.ok(flightService.updateFlight(id, request));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<FlightResponse> updateFlightStatus(@PathVariable Long id, @RequestParam Flight.FlightStatus status) {
        return ResponseEntity.ok(flightService.updateFlightStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlight(@PathVariable Long id) {
        flightService.deleteFlight(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<FlightResponse>> getAllFlights(
            @RequestParam(required = false) LocalDate date,
            @RequestParam(required = false, name = "airline") Long airlineId,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestHeader(value = "X-User-Role", required = false) String userRole
    ) {
        if (date != null) {
            return ResponseEntity.ok(flightService.getFlightsByDate(date));
        }
        return ResponseEntity.ok(flightService.getFlightsForUser(userEmail, userRole, airlineId));
    }

    @GetMapping("/{id}/passengers")
    public ResponseEntity<List<FlightPassengerManifestResponse>> getFlightPassengers(@PathVariable Long id) {
        return ResponseEntity.ok(flightService.getFlightPassengers(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<FlightResponse>> searchFlights(
            @RequestParam Long departureAirportId,
            @RequestParam Long arrivalAirportId,
            @RequestParam LocalDateTime departureDate) {
        return ResponseEntity.ok(flightService.searchFlights(departureAirportId, arrivalAirportId, departureDate));
    }

    @PostMapping("/search/advanced")
    public ResponseEntity<List<FlightResponse>> searchWithFilters(@Valid @RequestBody FlightSearchFilterDTO filter) {
        return ResponseEntity.ok(flightService.searchWithFilters(filter));
    }

    @GetMapping("/airline/{airlineId}")
    public ResponseEntity<List<FlightResponse>> getFlightsByAirlineId(@PathVariable Long airlineId) {
        return ResponseEntity.ok(flightService.getFlightsByAirlineId(airlineId));
    }

    @PutMapping("/{flightId}/reduce-seats")
    public ResponseEntity<Boolean> updateAvailableSeats(
            @PathVariable Long flightId,
            @RequestParam Integer seatsToReduce) {
        return ResponseEntity.ok(flightService.updateAvailableSeats(flightId, seatsToReduce));
    }

    @PutMapping("/{flightId}/available-seats")
    public ResponseEntity<Void> setAvailableSeats(
            @PathVariable Long flightId,
            @RequestParam Integer count) {
        flightService.setAvailableSeats(flightId, count);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/seat-config")
    public ResponseEntity<List<SeatClassConfigResponse>> getSeatConfig(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestHeader(value = "X-User-Role", required = false) String userRole
    ) {
        return ResponseEntity.ok(flightService.getSeatConfig(id, userEmail, userRole));
    }

    @PostMapping("/{id}/seat-config")
    public ResponseEntity<List<SeatClassConfigResponse>> saveSeatConfig(
            @PathVariable Long id,
            @Valid @RequestBody SeatConfigRequest request,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestHeader(value = "X-User-Role", required = false) String userRole
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(flightService.saveSeatConfig(id, request, userEmail, userRole));
    }
}
