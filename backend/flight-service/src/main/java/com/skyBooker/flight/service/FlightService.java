package com.skyBooker.flight.service;

import com.skyBooker.flight.dto.FlightRequest;
import com.skyBooker.flight.dto.FlightPassengerManifestResponse;
import com.skyBooker.flight.dto.FlightResponse;
import com.skyBooker.flight.dto.FlightSearchFilterDTO;
import com.skyBooker.flight.dto.PagedFlightResponse;
import com.skyBooker.flight.dto.PopularDestinationResponse;
import com.skyBooker.flight.dto.SeatClassConfigResponse;
import com.skyBooker.flight.dto.SeatConfigRequest;
import com.skyBooker.flight.entity.Flight;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface FlightService {
    FlightResponse createFlight(FlightRequest request);
    FlightResponse getFlightById(Long id);
    FlightResponse updateFlight(Long id, FlightRequest request);
    void deleteFlight(Long id);
    List<FlightResponse> getAllFlights();
    List<FlightResponse> getFlightsByDate(LocalDate date);
    List<FlightResponse> getFlightsForUser(String userEmail, String userRole, Long airlineId);
    List<FlightResponse> searchFlights(Long departureAirportId, Long arrivalAirportId, LocalDateTime departureDate);
    List<FlightResponse> getFlightsByAirlineId(Long airlineId);
    List<FlightPassengerManifestResponse> getFlightPassengers(Long flightId);
    FlightResponse updateFlightStatus(Long id, Flight.FlightStatus status);
    boolean updateAvailableSeats(Long flightId, Integer seatsToReduce);
    void setAvailableSeats(Long flightId, Integer count);
    List<FlightResponse> searchWithFilters(FlightSearchFilterDTO filter);
    List<SeatClassConfigResponse> saveSeatConfig(Long flightId, SeatConfigRequest request, String userEmail, String userRole);
    List<SeatClassConfigResponse> getSeatConfig(Long flightId, String userEmail, String userRole);
    List<PopularDestinationResponse> getPopularDestinations();
    List<FlightResponse> getFlightsByDestination(String iataCode);
    List<FlightResponse> getOnTimeFlightsByAirlineId(Long airlineId);

    /**
     * Admin-only paginated flight fetch. Skips isFlightActive() checks for performance.
     * @param page zero-based page number
     * @param size number of flights per page
     * @param status flight status filter; "ALL" or null returns all statuses
     */
    PagedFlightResponse getFlightsPaginated(int page, int size, String status);
}

