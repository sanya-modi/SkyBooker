package com.skyBooker.flight.service;

import com.skyBooker.flight.dto.FlightRequest;
import com.skyBooker.flight.dto.FlightResponse;
import com.skyBooker.flight.dto.FlightSearchFilterDTO;
import com.skyBooker.flight.entity.Flight;

import java.time.LocalDateTime;
import java.util.List;

public interface FlightService {
    FlightResponse createFlight(FlightRequest request);
    FlightResponse getFlightById(Long id);
    FlightResponse updateFlight(Long id, FlightRequest request);
    void deleteFlight(Long id);
    List<FlightResponse> getAllFlights();
    List<FlightResponse> searchFlights(Long departureAirportId, Long arrivalAirportId, LocalDateTime departureDate);
    List<FlightResponse> getFlightsByAirlineId(Long airlineId);
    FlightResponse updateFlightStatus(Long id, Flight.FlightStatus status);
    boolean updateAvailableSeats(Long flightId, Integer seatsToReduce);
    List<FlightResponse> searchWithFilters(FlightSearchFilterDTO filter);
}
