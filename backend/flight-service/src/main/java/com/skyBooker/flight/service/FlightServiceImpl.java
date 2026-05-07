package com.skyBooker.flight.service;

import com.skyBooker.flight.dto.FlightRequest;
import com.skyBooker.flight.dto.FlightPassengerManifestResponse;
import com.skyBooker.flight.dto.FlightResponse;
import com.skyBooker.flight.dto.FlightSearchFilterDTO;
import com.skyBooker.flight.dto.PopularDestinationResponse;
import com.skyBooker.flight.dto.SeatClassConfigResponse;
import com.skyBooker.flight.dto.SeatConfigRequest;
import com.skyBooker.flight.dto.remote.*;
import com.skyBooker.flight.entity.Flight;
import com.skyBooker.flight.exception.FlightException;
import com.skyBooker.flight.repository.FlightRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FlightServiceImpl implements FlightService {

    private final FlightRepository flightRepository;
    private final RestTemplate restTemplate;

    @Value("${services.booking.base-url}")
    private String bookingServiceBaseUrl;

    @Value("${services.passenger.base-url}")
    private String passengerServiceBaseUrl;

    @Value("${services.auth.base-url}")
    private String authServiceBaseUrl;

    @Value("${services.notification.base-url}")
    private String notificationServiceBaseUrl;

    @Value("${services.seat.base-url:http://localhost:8083}")
    private String seatServiceBaseUrl;

    @Value("${services.airline-airport.base-url:http://localhost:8082}")
    private String airlineAirportServiceBaseUrl;

    @Override
    public FlightResponse createFlight(FlightRequest request) {
        validateAirlineAndAirportsActive(request.getAirlineId(), request.getDepartureAirportId(), request.getArrivalAirportId());

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
        
        // Initialize seats for the flight
        try {
            restTemplate.postForEntity(
                seatServiceBaseUrl + "/seats/initialize",
                new java.util.HashMap<String, Object>() {{
                    put("flightId", savedFlight.getId());
                    put("totalSeats", savedFlight.getTotalSeats());
                }},
                Void.class
            );
        } catch (Exception e) {
            // Log but don't fail flight creation if seat initialization fails
            System.err.println("Failed to initialize seats for flight " + savedFlight.getId() + ": " + e.getMessage());
        }
        
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
                .filter(flight -> isFlightActive(flight.getAirlineId(), flight.getDepartureAirportId(), flight.getArrivalAirportId()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FlightResponse> getFlightsByDate(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay().minusNanos(1);

        return flightRepository.findByDepartureTimeBetweenOrderByDepartureTimeAsc(startOfDay, endOfDay).stream()
                .filter(flight -> isFlightActive(flight.getAirlineId(), flight.getDepartureAirportId(), flight.getArrivalAirportId()))
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FlightResponse> getFlightsForUser(String userEmail, String userRole, Long airlineId) {
        if ("AIRLINE_STAFF".equalsIgnoreCase(userRole)) {
            Long resolvedAirlineId = null;
            if (userEmail != null && !userEmail.isBlank()) {
                RemoteUserResponse user = fetchUserByEmail(userEmail);
                resolvedAirlineId = user != null ? user.getAirlineId() : null;
            }
            if (resolvedAirlineId == null) {
                throw new FlightException("Airline staff user is not mapped to an airline", "AIRLINE_NOT_FOUND");
            }
            return getFlightsByAirlineId(resolvedAirlineId);
        }
        if (airlineId != null) {
            return getFlightsByAirlineId(airlineId);
        }
        return getAllFlights();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FlightResponse> searchFlights(Long departureAirportId, Long arrivalAirportId, LocalDateTime departureDate) {
        return flightRepository.findAvailableFlights(departureAirportId, arrivalAirportId, departureDate).stream()
                .filter(flight -> isFlightActive(flight.getAirlineId(), flight.getDepartureAirportId(), flight.getArrivalAirportId()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FlightResponse> getFlightsByAirlineId(Long airlineId) {
        return flightRepository.findByAirlineId(airlineId).stream()
                .filter(flight -> isFlightActive(flight.getAirlineId(), flight.getDepartureAirportId(), flight.getArrivalAirportId()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FlightPassengerManifestResponse> getFlightPassengers(Long flightId) {
        getFlightEntity(flightId);

        List<RemoteBookingResponse> bookings = Objects.requireNonNullElse(fetchConfirmedBookings(flightId), Collections.emptyList());
        List<FlightPassengerManifestResponse> manifest = new ArrayList<>();

        for (RemoteBookingResponse booking : bookings) {
            List<RemotePassengerResponse> passengers = Objects.requireNonNullElse(
                    fetchPassengersByBooking(booking.getId()),
                    Collections.emptyList()
            );
            RemoteUserResponse user = fetchUser(booking.getUserId());
            List<String> selectedSeats = booking.getSelectedSeats() != null ? booking.getSelectedSeats() : Collections.emptyList();

            for (int index = 0; index < passengers.size(); index++) {
                RemotePassengerResponse passenger = passengers.get(index);
                String seat = index < selectedSeats.size() ? selectedSeats.get(index) : null;
                manifest.add(new FlightPassengerManifestResponse(
                        passenger.getId(),
                        booking.getId(),
                        booking.getUserId(),
                        (passenger.getFirstName() + " " + passenger.getLastName()).trim(),
                        passenger.getEmail() != null && !passenger.getEmail().isBlank() ? passenger.getEmail() : user != null ? user.getEmail() : null,
                        passenger.getPhoneNumber() != null && !passenger.getPhoneNumber().isBlank() ? passenger.getPhoneNumber() : user != null ? user.getPhoneNumber() : null,
                        seat,
                        passenger.getPassportNumber(),
                        user == null || !Boolean.TRUE.equals(user.getIsActive()),
                        buildUserName(user),
                        user != null ? user.getEmail() : null,
                        user != null ? user.getPhoneNumber() : null
                ));
            }
        }

        return manifest;
    }

    @Override
    public FlightResponse updateFlightStatus(Long id, Flight.FlightStatus status) {
        Flight flight = getFlightEntity(id);
        flight.setStatus(status);
        Flight updatedFlight = flightRepository.save(flight);
        notifyPassengersAboutStatusChange(updatedFlight);
        return mapToResponse(updatedFlight);
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
    public void setAvailableSeats(Long flightId, Integer count) {
        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new FlightException("Flight not found", "FLIGHT_NOT_FOUND"));
        flight.setAvailableSeats(count);
        flightRepository.save(flight);
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
                .filter(flight -> isFlightActive(flight.getAirlineId(), flight.getDepartureAirportId(), flight.getArrivalAirportId()))
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<SeatClassConfigResponse> saveSeatConfig(Long flightId, SeatConfigRequest request, String userEmail, String userRole) {
        validateFlightAccess(flightId, userEmail, userRole);

        HttpHeaders headers = new HttpHeaders();
        HttpEntity<SeatConfigRequest> entity = new HttpEntity<>(request, headers);
        ResponseEntity<List<SeatClassConfigResponse>> response = restTemplate.exchange(
                seatServiceBaseUrl + "/seats/flight/" + flightId + "/config",
                HttpMethod.POST,
                entity,
                new ParameterizedTypeReference<>() {}
        );
        return response.getBody() != null ? response.getBody() : List.of();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SeatClassConfigResponse> getSeatConfig(Long flightId, String userEmail, String userRole) {
        validateFlightAccess(flightId, userEmail, userRole);

        ResponseEntity<List<SeatClassConfigResponse>> response = restTemplate.exchange(
                seatServiceBaseUrl + "/seats/flight/" + flightId + "/config",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {}
        );
        return response.getBody() != null ? response.getBody() : List.of();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PopularDestinationResponse> getPopularDestinations() {
        List<Long> topAirportIds = flightRepository.findTopDestinationsByBookingCount(PageRequest.of(0, 6));
        
        if (topAirportIds.isEmpty()) {
            return Collections.emptyList();
        }

        return topAirportIds.stream()
                .map(id -> {
                    try {
                        RemoteAirportResponse airport = restTemplate.getForObject(
                                airlineAirportServiceBaseUrl + "/airports/" + id,
                                RemoteAirportResponse.class
                        );
                        if (airport != null) {
                            String imageUrl = String.format(
    "https://source.unsplash.com/800x600/?%s,travel,city",
    airport.getCity().replace(" ", "+")
);
                            return new PopularDestinationResponse(
                                    airport.getCity(),
                                    airport.getIataCode(),
                                    imageUrl
                            );
                        }
                    } catch (Exception e) {
                        System.err.println("Failed to fetch airport details for ID " + id + ": " + e.getMessage());
                    }
                    return null;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FlightResponse> getFlightsByDestination(String iataCode) {
        try {
            RemoteAirportResponse airport = restTemplate.getForObject(
                    airlineAirportServiceBaseUrl + "/airports/iata/" + iataCode,
                    RemoteAirportResponse.class
            );
            if (airport == null) {
                return Collections.emptyList();
            }
            return flightRepository.findByArrivalAirportId(airport.getId()).stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Failed to fetch flights for destination " + iataCode + ": " + e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<FlightResponse> getOnTimeFlightsByAirlineId(Long airlineId) {
        return flightRepository.findByAirlineIdAndStatus(airlineId, Flight.FlightStatus.ON_TIME).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private Flight getFlightEntity(Long id) {
        return flightRepository.findById(id)
                .orElseThrow(() -> new FlightException("Flight not found", "FLIGHT_NOT_FOUND"));
    }

    private List<RemoteBookingResponse> fetchConfirmedBookings(Long flightId) {
        ResponseEntity<List<RemoteBookingResponse>> response = restTemplate.exchange(
                bookingServiceBaseUrl + "/bookings/flight/" + flightId + "/confirmed",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {
                }
        );

        return response.getBody() != null ? response.getBody() : Collections.emptyList();
    }

    private List<RemotePassengerResponse> fetchPassengersByBooking(Long bookingId) {
        ResponseEntity<List<RemotePassengerResponse>> response = restTemplate.exchange(
                passengerServiceBaseUrl + "/passengers/booking/" + bookingId,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {
                }
        );

        return response.getBody() != null ? response.getBody() : Collections.emptyList();
    }

    private RemoteUserResponse fetchUser(Long userId) {
        try {
            return restTemplate.getForObject(authServiceBaseUrl + "/auth/users/" + userId, RemoteUserResponse.class);
        } catch (RestClientException exception) {
            return null;
        }
    }

    private RemoteUserResponse fetchUserByEmail(String email) {
        try {
            return restTemplate.getForObject(authServiceBaseUrl + "/auth/users/email/" + email, RemoteUserResponse.class);
        } catch (RestClientException exception) {
            return null;
        }
    }

    private void notifyPassengersAboutStatusChange(Flight flight) {
        List<RemoteBookingResponse> bookings = Objects.requireNonNullElse(fetchConfirmedBookings(flight.getId()), Collections.emptyList());
        if (bookings.isEmpty()) {
            return;
        }

        List<FlightStatusNotificationRequest.Recipient> recipients = bookings.stream()
                .flatMap(booking -> {
                    RemoteUserResponse user = fetchUser(booking.getUserId());
                    List<RemotePassengerResponse> passengers = Objects.requireNonNullElse(
                            fetchPassengersByBooking(booking.getId()),
                            Collections.emptyList()
                    );
                    List<FlightStatusNotificationRequest.Recipient> bookingRecipients = new ArrayList<>();

                    for (RemotePassengerResponse passenger : passengers) {
                        if (passenger.getEmail() != null && !passenger.getEmail().isBlank()) {
                            bookingRecipients.add(new FlightStatusNotificationRequest.Recipient(
                                    booking.getUserId(),
                                    booking.getId(),
                                    passenger.getEmail()
                            ));
                        }
                    }

                    if (bookingRecipients.isEmpty() && user != null && user.getEmail() != null && !user.getEmail().isBlank()) {
                        bookingRecipients.add(new FlightStatusNotificationRequest.Recipient(
                                booking.getUserId(),
                                booking.getId(),
                                user.getEmail()
                        ));
                    }

                    return bookingRecipients.stream();
                })
                .filter(Objects::nonNull)
                .collect(Collectors.collectingAndThen(
                        Collectors.toMap(
                                FlightStatusNotificationRequest.Recipient::getEmail,
                                recipient -> recipient,
                                (existing, ignored) -> existing
                        ),
                        map -> new ArrayList<>(map.values())
                ));

        if (recipients.isEmpty()) {
            return;
        }

        FlightStatusNotificationRequest request = new FlightStatusNotificationRequest(
                flight.getFlightNumber(),
                flight.getDepartureAirportId() + " -> " + flight.getArrivalAirportId(),
                flight.getStatus().name(),
                buildStatusMessage(flight.getStatus()),
                recipients
        );

        restTemplate.postForEntity(notificationServiceBaseUrl + "/notifications/flight-status", request, Void.class);
    }

    private String buildStatusMessage(Flight.FlightStatus status) {
        return switch (status) {
            case DELAYED -> "Your flight has been delayed. Please check the latest departure updates.";
            case CANCELLED -> "Your flight has been cancelled. Please contact support or rebook your trip.";
            case DEPARTED -> "Your flight has departed.";
            case ARRIVED -> "Your flight has arrived.";
            case ON_TIME -> "Your flight is currently on time.";
        };
    }

    private String buildUserName(RemoteUserResponse user) {
        if (user == null) {
            return null;
        }

        String firstName = user.getFirstName() != null ? user.getFirstName().trim() : "";
        String lastName = user.getLastName() != null ? user.getLastName().trim() : "";
        String fullName = (firstName + " " + lastName).trim();
        return fullName.isBlank() ? user.getEmail() : fullName;
    }

    private void validateFlightAccess(Long flightId, String userEmail, String userRole) {
        if (!"AIRLINE_STAFF".equalsIgnoreCase(userRole)) {
            return;
        }

        Flight flight = getFlightEntity(flightId);
        RemoteUserResponse user = fetchUserByEmail(userEmail);
        if (user == null || user.getAirlineId() == null || !user.getAirlineId().equals(flight.getAirlineId())) {
            throw new FlightException("You do not have access to manage this flight", "FLIGHT_ACCESS_DENIED");
        }
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

    private void validateAirlineAndAirportsActive(Long airlineId, Long departureAirportId, Long arrivalAirportId) {
        try {
            restTemplate.getForEntity(airlineAirportServiceBaseUrl + "/airlines/" + airlineId + "/active", Object.class);
            restTemplate.getForEntity(airlineAirportServiceBaseUrl + "/airports/" + departureAirportId + "/active", Object.class);
            restTemplate.getForEntity(airlineAirportServiceBaseUrl + "/airports/" + arrivalAirportId + "/active", Object.class);
        } catch (Exception e) {
            throw new FlightException("Airline or airport is inactive or not found", "INACTIVE_ENTITY");
        }
    }

    private boolean isFlightActive(Long airlineId, Long departureAirportId, Long arrivalAirportId) {
        try {
            restTemplate.getForEntity(airlineAirportServiceBaseUrl + "/airlines/" + airlineId + "/active", Object.class);
            System.out.println("[FLIGHT-DEBUG] Airline " + airlineId + " is active: true");
        } catch (Exception e) {
            System.out.println("[FLIGHT-DEBUG] Airline " + airlineId + " is active: false (Error: " + e.getMessage() + ")");
            return false;
        }
        try {
            restTemplate.getForEntity(airlineAirportServiceBaseUrl + "/airports/" + departureAirportId + "/active", Object.class);
            System.out.println("[FLIGHT-DEBUG] Departure Airport " + departureAirportId + " is active: true");
        } catch (Exception e) {
            System.out.println("[FLIGHT-DEBUG] Departure Airport " + departureAirportId + " is active: false (Error: " + e.getMessage() + ")");
            return false;
        }
        try {
            restTemplate.getForEntity(airlineAirportServiceBaseUrl + "/airports/" + arrivalAirportId + "/active", Object.class);
            System.out.println("[FLIGHT-DEBUG] Arrival Airport " + arrivalAirportId + " is active: true");
        } catch (Exception e) {
            System.out.println("[FLIGHT-DEBUG] Arrival Airport " + arrivalAirportId + " is active: false (Error: " + e.getMessage() + ")");
            return false;
        }
        return true;
    }
}
