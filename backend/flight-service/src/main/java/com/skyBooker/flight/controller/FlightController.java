package com.skyBooker.flight.controller;

import com.skyBooker.flight.dto.FlightRequest;
import com.skyBooker.flight.dto.FlightResponse;
import com.skyBooker.flight.dto.FlightSearchFilterDTO;
import com.skyBooker.flight.entity.Flight;
import com.skyBooker.flight.service.FlightService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<List<FlightResponse>> getAllFlights() {
        return ResponseEntity.ok(flightService.getAllFlights());
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
}
