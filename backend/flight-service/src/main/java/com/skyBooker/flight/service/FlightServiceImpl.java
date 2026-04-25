package com.skyBooker.flight.service;

import com.skyBooker.flight.dto.FlightRequest;
import com.skyBooker.flight.dto.FlightResponse;
import com.skyBooker.flight.dto.FlightSearchFilterDTO;
import com.skyBooker.flight.entity.Flight;
import com.skyBooker.flight.exception.FlightException;
import com.skyBooker.flight.repository.FlightRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FlightServiceImpl implements FlightService {

    private final FlightRepository flightRepository;

    @Override
    public FlightResponse createFlight(FlightRequest request) {
        if (flightRepository.findByFlightNumber(request.getFlightNumber()).isPresent()) {
            throw new FlightException("Flight number already exists", "FLIGHT_EXISTS");
        }

        if (request.getArrivalTime().isBefore(request.getDepartureTime())) {
            throw new FlightException("Arrival time must be after departure time", "INVALID_TIME");
        }

        Flight flight = new Flight();
        flight.setFlightNumber(request.getFlightNumber());
        flight.setAircraftType(request.getAircraftType());
        flight.setAirlineId(request.getAirlineId());
        flight.setDepartureAirportId(request.getDepartureAirportId());
        flight.setArrivalAirportId(request.getArrivalAirportId());
        flight.setDepartureTime(request.getDepartureTime());
        flight.setArrivalTime(request.getArrivalTime());
        flight.setTotalSeats(request.getTotalSeats());
        flight.setAvailableSeats(request.getTotalSeats());
        flight.setBaseFare(request.getBaseFare());

        Flight savedFlight = flightRepository.save(flight);
        return mapToResponse(savedFlight);
    }

    @Override
    @Transactional(readOnly = true)
    public FlightResponse getFlightById(Long id) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new FlightException("Flight not found", "FLIGHT_NOT_FOUND"));
        return mapToResponse(flight);
    }

    @Override
    public FlightResponse updateFlight(Long id, FlightRequest request) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new FlightException("Flight not found", "FLIGHT_NOT_FOUND"));

        if (!flight.getFlightNumber().equals(request.getFlightNumber()) &&
                flightRepository.findByFlightNumber(request.getFlightNumber()).isPresent()) {
            throw new FlightException("Flight number already exists", "FLIGHT_EXISTS");
        }

        flight.setFlightNumber(request.getFlightNumber());
        flight.setAircraftType(request.getAircraftType());
        flight.setDepartureTime(request.getDepartureTime());
        flight.setArrivalTime(request.getArrivalTime());
        flight.setBaseFare(request.getBaseFare());

        Flight updatedFlight = flightRepository.save(flight);
        return mapToResponse(updatedFlight);
    }

    @Override
    public void deleteFlight(Long id) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new FlightException("Flight not found", "FLIGHT_NOT_FOUND"));
        flight.setStatus(Flight.FlightStatus.CANCELLED);
        flightRepository.save(flight);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FlightResponse> getAllFlights() {
        return flightRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FlightResponse> searchFlights(Long departureAirportId, Long arrivalAirportId, LocalDateTime departureDate) {
        return flightRepository.findAvailableFlights(departureAirportId, arrivalAirportId, departureDate).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FlightResponse> getFlightsByAirlineId(Long airlineId) {
        return flightRepository.findByAirlineId(airlineId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public FlightResponse updateFlightStatus(Long id, Flight.FlightStatus status) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new FlightException("Flight not found", "FLIGHT_NOT_FOUND"));
        flight.setStatus(status);
        return mapToResponse(flightRepository.save(flight));
    }

    @Override
    public boolean updateAvailableSeats(Long flightId, Integer seatsToReduce) {
        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new FlightException("Flight not found", "FLIGHT_NOT_FOUND"));

        if (flight.getAvailableSeats() < seatsToReduce) {
            return false;
        }

        flight.setAvailableSeats(flight.getAvailableSeats() - seatsToReduce);
        flightRepository.save(flight);
        return true;
    }

    @Override
    public List<FlightResponse> searchWithFilters(FlightSearchFilterDTO filter) {

        LocalDateTime startOfDay = filter.getDepartureDate().atStartOfDay();
        LocalDateTime endOfDay = filter.getDepartureDate().atTime(23, 59, 59);

        List<Flight> flights = flightRepository.searchFlights(
                filter.getDepartureAirportId(),
                filter.getArrivalAirportId(),
                startOfDay,
                endOfDay
        );

        return flights.stream()
                .map(this::mapToResponse)
                .toList();
    }

    private FlightResponse mapToResponse(Flight flight) {
        return new FlightResponse(
                flight.getId(),
                flight.getFlightNumber(),
                flight.getAircraftType(),
                flight.getAirlineId(),
                flight.getDepartureAirportId(),
                flight.getArrivalAirportId(),
                flight.getDepartureTime(),
                flight.getArrivalTime(),
                flight.getTotalSeats(),
                flight.getAvailableSeats(),
                flight.getBaseFare(),
                flight.getStatus().toString()
        );
    }
}
