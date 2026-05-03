package com.skyBooker.booking.service;

import com.skyBooker.booking.dto.BookingRequest;
import com.skyBooker.booking.dto.BookingResponse;
import com.skyBooker.booking.dto.TicketLookupResponse;
import com.skyBooker.booking.entity.Booking;
import com.skyBooker.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final WebClient.Builder webClientBuilder;
    private final PdfTicketGenerator pdfTicketGenerator;
    private final RabbitTemplate rabbitTemplate;

    @Value("${services.flight-base-url:http://localhost:8082}")
    private String flightServiceUrl;

    @Value("${services.notification-base-url:http://localhost:8087}")
    private String notificationServiceUrl;

    @Value("${services.auth-base-url:http://localhost:8081}")
    private String authServiceUrl;

    @Value("${services.seat-base-url:http://localhost:8083}")
    private String seatServiceUrl;

    @Value("${services.payment-base-url:http://localhost:8086}")
    private String paymentServiceUrl;

    @Value("${services.passenger-base-url:http://localhost:8085}")
    private String passengerServiceUrl;

    @Override
    public BookingResponse createBooking(BookingRequest request) {
        validateBookingRequest(request);
        String pnr = generatePNR();

        BigDecimal baseFare = getFlightBaseFare(request.getFlightId())
                .multiply(BigDecimal.valueOf(request.getNumberOfPassengers()));
        
        BigDecimal taxes = baseFare.multiply(BigDecimal.valueOf(0.18));
        BigDecimal ancillaryCharges = BigDecimal.valueOf(request.getNumberOfPassengers() * 5);
        BigDecimal totalFare = baseFare.add(taxes).add(ancillaryCharges);

        Booking booking = new Booking();
        booking.setPnr(pnr);
        booking.setUserId(request.getUserId());
        booking.setFlightId(request.getFlightId());
        booking.setNumberOfPassengers(request.getNumberOfPassengers());
        booking.setSelectedSeats(request.getSelectedSeats());
        booking.setBaseFare(baseFare);
        booking.setTaxes(taxes);
        booking.setAncillaryCharges(ancillaryCharges);
        booking.setTotalFare(totalFare);

        Booking savedBooking = bookingRepository.save(booking);
        return mapToResponse(savedBooking, request.getSelectedSeats());
    }

    private void validateBookingRequest(BookingRequest request) {
        if (request.getSelectedSeats() == null || request.getSelectedSeats().size() != request.getNumberOfPassengers()) {
            throw new IllegalArgumentException("Selected seats must match the number of passengers");
        }

        if (request.getPassengers() != null && request.getPassengers().size() != request.getNumberOfPassengers()) {
            throw new IllegalArgumentException("Passenger count must match the number of passengers");
        }

        if (request.getPassengers() != null) {
            for (BookingRequest.PassengerValidationRequest passenger : request.getPassengers()) {
                validatePassengerCategoryAge(passenger.getDateOfBirth(), passenger.getCategory());
            }
        }
    }

    private void validatePassengerCategoryAge(LocalDate dateOfBirth, BookingRequest.PassengerCategory category) {
        int age = Period.between(dateOfBirth, LocalDate.now()).getYears();
        if (age < 0) {
            throw new IllegalArgumentException("Date of birth cannot be in the future");
        }

        switch (category) {
            case ADULT -> {
                if (age <= 12) {
                    throw new IllegalArgumentException("Passenger must be older than 12 years");
                }
            }
            case CHILD -> {
                if (age < 2 || age > 12) {
                    throw new IllegalArgumentException("Passenger age must be between 2 and 12 years");
                }
            }
            case INFANT -> {
                if (age >= 2) {
                    throw new IllegalArgumentException("Passenger must be below 2 years");
                }
            }
            default -> throw new IllegalArgumentException("Invalid passenger category");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return mapToResponse(booking, booking.getSelectedSeats());
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingByPnr(String pnr) {
        Booking booking = bookingRepository.findByPnr(pnr)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return mapToResponse(booking, booking.getSelectedSeats());
    }

    @Override
    @Transactional(readOnly = true)
    public TicketLookupResponse getTicketByPnr(String pnr) {
        Booking booking = bookingRepository.findByPnr(pnr)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        FlightDTO flight = getFlightDetails(booking.getFlightId());
        List<PassengerDTO> passengers = getPassengersByBookingId(booking.getId());

        return new TicketLookupResponse(
                mapToResponse(booking, booking.getSelectedSeats()),
                mapFlightSummary(flight),
                passengers.stream().map(this::mapPassengerSummary).toList()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(b -> mapToResponse(b, b.getSelectedSeats()))
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse updateBookingStatus(Long id, Booking.BookingStatus status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(status);
        Booking updated = bookingRepository.save(booking);
        
        if (status == Booking.BookingStatus.CONFIRMED) {
            bookSeats(updated);
            try {
                sendBookingConfirmationNotifications(updated);
            } catch (Exception e) {
                log.error("Failed to send booking confirmation notifications for booking {}, but booking is confirmed", id, e);
            }
        }
        
        return mapToResponse(updated, updated.getSelectedSeats());
    }

    @Override
    public BookingResponse webCheckIn(Long id, String seatNumber) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new RuntimeException("Only confirmed bookings can be checked in");
        }

        LocalDateTime departureTime = getFlightDepartureTime(booking.getFlightId());
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime checkInOpen = departureTime.minusHours(24);
        LocalDateTime checkInClose = departureTime.minusHours(1);

        if (now.isBefore(checkInOpen) || now.isAfter(checkInClose)) {
            throw new RuntimeException("Web check-in is allowed only from 24 hours to 1 hour before departure");
        }

        // Update seat if changed
        if (seatNumber != null && !seatNumber.isEmpty()) {
            List<String> currentSeats = booking.getSelectedSeats();
            if (currentSeats == null || currentSeats.isEmpty() || !currentSeats.contains(seatNumber)) {
                // Release old seat and book new one
                if (currentSeats != null && !currentSeats.isEmpty()) {
                    releaseSeats(booking);
                }
                booking.setSelectedSeats(List.of(seatNumber));
            }
        }

        booking.setCheckedIn(Boolean.TRUE);
        booking.setCheckedInAt(now);
        return mapToResponse(bookingRepository.save(booking), booking.getSelectedSeats());
    }

    @Override
    public int markNoShowsAfterGateClosure() {
        LocalDateTime now = LocalDateTime.now();
        List<Booking> confirmedBookings = bookingRepository.findByStatus(Booking.BookingStatus.CONFIRMED);
        int updatedCount = 0;

        for (Booking booking : confirmedBookings) {
            LocalDateTime departureTime = getFlightDepartureTime(booking.getFlightId());
            LocalDateTime gateClosure = departureTime.minusHours(1);
            if (now.isAfter(gateClosure) && !Boolean.TRUE.equals(booking.getCheckedIn())) {
                booking.setStatus(Booking.BookingStatus.NO_SHOW);
                bookingRepository.save(booking);
                updatedCount++;
            }
        }

        return updatedCount;
    }

    @Override
    public byte[] generateETicketPdf(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        try {
            FlightDTO flight = getFlightDetails(booking.getFlightId());
            if (flight == null) {
                throw new RuntimeException("Flight details not found for flight ID: " + booking.getFlightId());
            }
            Map<String, Object> flightDetails = buildFlightDetailsMap(flight);
            return pdfTicketGenerator.generateModernTicket(booking, flightDetails);
        } catch (Exception ex) {
            log.error("Failed to generate e-ticket PDF", ex);
            throw new RuntimeException("Failed to generate e-ticket PDF", ex);
        }
    }

    @Override
    public byte[] generateBoardingPassPdf(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!Boolean.TRUE.equals(booking.getCheckedIn())) {
            throw new RuntimeException("Boarding pass is available only after web check-in");
        }

        try {
            FlightDTO flight = getFlightDetails(booking.getFlightId());
            Map<String, Object> flightDetails = buildFlightDetailsMap(flight);
            return pdfTicketGenerator.generateModernTicket(booking, flightDetails);
        } catch (Exception ex) {
            log.error("Failed to generate boarding pass PDF", ex);
            throw new RuntimeException("Failed to generate boarding pass PDF", ex);
        }
    }

    @Scheduled(fixedDelayString = "${booking.no-show.scheduler-ms:1800000}")
    public void scheduledMarkNoShowsAfterGateClosure() {
        markNoShowsAfterGateClosure();
    }

    @Scheduled(fixedDelayString = "${booking.check-in-reminder.scheduler-ms:3600000}")
    public void scheduledSendCheckInReminders() {
        LocalDateTime now = LocalDateTime.now();
        List<Booking> confirmedBookings = bookingRepository.findByStatus(Booking.BookingStatus.CONFIRMED);

        for (Booking booking : confirmedBookings) {
            if (Boolean.TRUE.equals(booking.getCheckInReminderSent()) || Boolean.TRUE.equals(booking.getCheckedIn())) {
                continue;
            }

            LocalDateTime departureTime = getFlightDepartureTime(booking.getFlightId());
            LocalDateTime openWindow = departureTime.minusHours(24);
            LocalDateTime windowEnd = openWindow.plusHours(1);

            if (!now.isBefore(openWindow) && now.isBefore(windowEnd)) {
                sendCheckInReminderNotifications(booking);
                booking.setCheckInReminderSent(Boolean.TRUE);
                bookingRepository.save(booking);
            }
        }
    }

    @Override
    public void cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking is already cancelled");
        }
        
        if (booking.getStatus() == Booking.BookingStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel completed bookings");
        }
        
        // Update booking status
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(booking);
        
        // Release seats
        releaseSeats(booking);
        
        // Initiate refund
        initiateRefund(booking);
        
        // Send cancellation notification
        sendCancellationNotification(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getConfirmedBookingsByFlight(Long flightId) {
        return bookingRepository.findConfirmedBookingsByFlight(flightId).stream()
                .map(b -> mapToResponse(b, b.getSelectedSeats()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Long countConfirmedBookings(Long flightId) {
        return bookingRepository.countConfirmedBookingsByFlight(flightId);
    }

    private String generatePNR() {
        final String alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        String pnr;
        do {
            StringBuilder builder = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                int idx = ThreadLocalRandom.current().nextInt(alphabet.length());
                builder.append(alphabet.charAt(idx));
            }
            pnr = builder.toString();
        } while (bookingRepository.findByPnr(pnr).isPresent());
        return pnr;
    }

    private BigDecimal getFlightBaseFare(Long flightId) {
        return webClientBuilder.build()
                .get()
                .uri(flightServiceUrl + "/flights/{id}", flightId)
                .retrieve()
                .bodyToMono(FlightDTO.class)
                .block()
                .getBaseFare();
    }

    private LocalDateTime getFlightDepartureTime(Long flightId) {
        FlightDTO flight = getFlightDetails(flightId);
        if (flight == null || flight.getDepartureTime() == null) {
            throw new RuntimeException("Unable to fetch flight departure time");
        }
        return flight.getDepartureTime();
    }

    private FlightDTO getFlightDetails(Long flightId) {
        return webClientBuilder.build()
                .get()
                .uri(flightServiceUrl + "/flights/{id}", flightId)
                .retrieve()
                .bodyToMono(FlightDTO.class)
                .block();
    }

    private List<PassengerDTO> getPassengersByBookingId(Long bookingId) {
        PassengerDTO[] passengers = webClientBuilder.build()
                .get()
                .uri(passengerServiceUrl + "/passengers/booking/{bookingId}", bookingId)
                .retrieve()
                .bodyToMono(PassengerDTO[].class)
                .onErrorReturn(new PassengerDTO[0])
                .block();
        return passengers == null ? List.of() : List.of(passengers);
    }

    private Map<String, Object> buildFlightDetailsMap(FlightDTO flight) {
        Map<String, Object> details = new HashMap<>();
        details.put("flightNumber", flight.getFlightNumber());
        details.put("departureCode", "DEP");
        details.put("departureCity", "Departure City");
        details.put("arrivalCode", "ARR");
        details.put("arrivalCity", "Arrival City");
        details.put("date", flight.getDepartureTime().format(DateTimeFormatter.ofPattern("dd MMM yyyy")));
        details.put("departureTime", flight.getDepartureTime().format(DateTimeFormatter.ofPattern("HH:mm")));
        details.put("arrivalTime", flight.getDepartureTime().plusHours(2).format(DateTimeFormatter.ofPattern("HH:mm")));
        return details;
    }

    private void sendBookingConfirmationNotifications(Booking booking) {
        try {
            UserDTO user = getUserContact(booking.getUserId());
            if (user == null) return;

            byte[] ticketPdf = generateETicketPdf(booking.getId());
            FlightDTO flight = getFlightDetails(booking.getFlightId());
            
            Map<String, Object> bookingDetails = new HashMap<>();
            bookingDetails.put("flightNumber", flight.getFlightNumber());
            bookingDetails.put("departureCode", "DEP");
            bookingDetails.put("departureCity", "Departure City");
            bookingDetails.put("arrivalCode", "ARR");
            bookingDetails.put("arrivalCity", "Arrival City");
            bookingDetails.put("date", flight.getDepartureTime().format(DateTimeFormatter.ofPattern("dd MMM yyyy")));
            bookingDetails.put("departureTime", flight.getDepartureTime().format(DateTimeFormatter.ofPattern("HH:mm")));
            bookingDetails.put("arrivalTime", flight.getDepartureTime().plusHours(2).format(DateTimeFormatter.ofPattern("HH:mm")));
            bookingDetails.put("baseFare", "₹" + booking.getBaseFare());
            bookingDetails.put("taxes", "₹" + booking.getTaxes());
            bookingDetails.put("ancillary", "₹" + booking.getAncillaryCharges());
            bookingDetails.put("totalFare", "₹" + booking.getTotalFare());

            Map<String, Object> event = new HashMap<>();
            event.put("email", user.getEmail());
            event.put("pnr", booking.getPnr());
            event.put("bookingDetails", bookingDetails);
            event.put("ticketPdf", ticketPdf);

            rabbitTemplate.convertAndSend("notification.exchange", "notification.booking", event);
            log.info("Published booking event for PNR: {}", booking.getPnr());
        } catch (Exception e) {
            log.error("Error sending booking confirmation notifications", e);
        }
    }

    private void sendCheckInReminderNotifications(Booking booking) {
        UserDTO user = getUserContact(booking.getUserId());

        postNotification(booking, "IN_APP", "user-" + booking.getUserId());
        if (user != null && user.getEmail() != null && !user.getEmail().isBlank()) {
            postNotification(booking, "EMAIL", user.getEmail());
        }
        if (user != null && user.getPhoneNumber() != null && !user.getPhoneNumber().isBlank()) {
            postNotification(booking, "SMS", user.getPhoneNumber());
        }
    }

    private void postNotification(Booking booking, String channel, String recipient) {
        Map<String, Object> request = new HashMap<>();
        request.put("userId", booking.getUserId());
        request.put("bookingId", booking.getId());
        request.put("type", "CHECK_IN_REMINDER");
        request.put("channel", channel);
        request.put("subject", "Web check-in is now open");
        request.put("message", "Your web check-in window is open and closes 1 hour before departure.");
        request.put("recipient", recipient);

        webClientBuilder.build()
                .post()
                .uri(notificationServiceUrl + "/notifications")
                .bodyValue(request)
                .retrieve()
                .toBodilessEntity()
                .onErrorResume(ex -> reactor.core.publisher.Mono.empty())
                .block();
    }

    private UserDTO getUserContact(Long userId) {
        return webClientBuilder.build()
                .get()
                .uri(authServiceUrl + "/auth/users/{id}", userId)
                .retrieve()
                .bodyToMono(UserDTO.class)
                .onErrorResume(ex -> reactor.core.publisher.Mono.empty())
                .block();
    }

    private void releaseSeats(Booking booking) {
        try {
            if (booking.getSelectedSeats() != null && !booking.getSelectedSeats().isEmpty()) {
                for (String seatNumber : booking.getSelectedSeats()) {
                    webClientBuilder.build()
                            .delete()
                            .uri(seatServiceUrl + "/seats/release/{flightId}/{seatNumber}",
                                 booking.getFlightId(), seatNumber)
                            .retrieve()
                            .toBodilessEntity()
                            .onErrorResume(ex -> {
                                log.error("Failed to release seat: {}", seatNumber, ex);
                                return reactor.core.publisher.Mono.empty();
                            })
                            .block();
                }
                log.info("Released {} seats for booking {}", booking.getSelectedSeats().size(), booking.getId());
            }
        } catch (Exception e) {
            log.error("Error releasing seats for booking {}", booking.getId(), e);
        }
    }

    private void bookSeats(Booking booking) {
        try {
            if (booking.getSelectedSeats() == null || booking.getSelectedSeats().isEmpty()) {
                return;
            }

            for (String seatNumber : booking.getSelectedSeats()) {
                Map<String, Object> request = new HashMap<>();
                request.put("flightId", booking.getFlightId());
                request.put("seatNumber", seatNumber);
                request.put("bookingId", booking.getId());
                request.put("passengerId", booking.getUserId());

                webClientBuilder.build()
                        .post()
                        .uri(seatServiceUrl + "/seats/book")
                        .bodyValue(request)
                        .retrieve()
                        .toBodilessEntity()
                        .block();
            }
            log.info("Booked {} seats for booking {}", booking.getSelectedSeats().size(), booking.getId());
        } catch (Exception exception) {
            throw new RuntimeException("Failed to confirm seat booking", exception);
        }
    }

    private void initiateRefund(Booking booking) {
        try {
            if (booking.getPaymentId() != null) {
                Map<String, Object> refundRequest = new HashMap<>();
                refundRequest.put("bookingId", booking.getId());
                refundRequest.put("amount", booking.getTotalFare());
                refundRequest.put("reason", "Booking cancelled by user");

                webClientBuilder.build()
                        .post()
                        .uri(paymentServiceUrl + "/payments/{paymentId}/refund", booking.getPaymentId())
                        .bodyValue(refundRequest)
                        .retrieve()
                        .toBodilessEntity()
                        .onErrorResume(ex -> {
                            log.error("Failed to initiate refund for booking {}", booking.getId(), ex);
                            return reactor.core.publisher.Mono.empty();
                        })
                        .block();
                
                log.info("Initiated refund for booking {} with amount {}", booking.getId(), booking.getTotalFare());
            }
        } catch (Exception e) {
            log.error("Error initiating refund for booking {}", booking.getId(), e);
        }
    }

    private void sendCancellationNotification(Booking booking) {
        try {
            UserDTO user = getUserContact(booking.getUserId());
            if (user == null) return;

            Map<String, Object> notification = new HashMap<>();
            notification.put("userId", booking.getUserId());
            notification.put("bookingId", booking.getId());
            notification.put("type", "BOOKING_CANCELLED");
            notification.put("channel", "EMAIL");
            notification.put("subject", "Booking Cancelled - PNR: " + booking.getPnr());
            notification.put("message", "Your booking has been cancelled. Refund will be processed in 5-7 business days.");
            notification.put("recipient", user.getEmail());

            webClientBuilder.build()
                    .post()
                    .uri(notificationServiceUrl + "/notifications")
                    .bodyValue(notification)
                    .retrieve()
                    .toBodilessEntity()
                    .onErrorResume(ex -> {
                        log.error("Failed to send cancellation notification", ex);
                        return reactor.core.publisher.Mono.empty();
                    })
                    .block();
        } catch (Exception e) {
            log.error("Error sending cancellation notification", e);
        }
    }

    private BookingResponse mapToResponse(Booking booking, List<String> selectedSeats) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setPnr(booking.getPnr());
        response.setUserId(booking.getUserId());
        response.setFlightId(booking.getFlightId());
        response.setNumberOfPassengers(booking.getNumberOfPassengers());
        response.setBaseFare(booking.getBaseFare());
        response.setTaxes(booking.getTaxes());
        response.setAncillaryCharges(booking.getAncillaryCharges());
        response.setTotalFare(booking.getTotalFare());
        response.setStatus(booking.getStatus().toString());
        response.setBookingDate(booking.getBookingDate());
        response.setCheckedIn(booking.getCheckedIn());
        response.setCheckedInAt(booking.getCheckedInAt());
        response.setSelectedSeats(selectedSeats);
        return response;
    }

    private TicketLookupResponse.FlightSummary mapFlightSummary(FlightDTO flight) {
        return new TicketLookupResponse.FlightSummary(
                flight.getId(),
                flight.getFlightNumber(),
                flight.getAircraftType(),
                flight.getAirlineId(),
                flight.getDepartureAirportId(),
                flight.getArrivalAirportId(),
                flight.getDepartureTime() != null ? flight.getDepartureTime().toString() : null,
                flight.getArrivalTime() != null ? flight.getArrivalTime().toString() : null,
                flight.getTotalSeats(),
                flight.getAvailableSeats(),
                flight.getStatus()
        );
    }

    private TicketLookupResponse.PassengerSummary mapPassengerSummary(PassengerDTO passenger) {
        return new TicketLookupResponse.PassengerSummary(
                passenger.getId(),
                passenger.getBookingId(),
                passenger.getFirstName(),
                passenger.getLastName(),
                passenger.getEmail(),
                passenger.getPhoneNumber(),
                passenger.getPassportNumber(),
                passenger.getDateOfBirth(),
                passenger.getCategory(),
                passenger.getGender(),
                passenger.getNationality(),
                passenger.getSpecialRequests()
        );
    }

    public static class FlightDTO {
        private Long id;
        private String flightNumber;
        private String aircraftType;
        private Long airlineId;
        private Long departureAirportId;
        private Long arrivalAirportId;
        private LocalDateTime arrivalTime;
        private Integer totalSeats;
        private Integer availableSeats;
        private BigDecimal baseFare;
        private LocalDateTime departureTime;
        private String status;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getFlightNumber() { return flightNumber; }
        public void setFlightNumber(String flightNumber) { this.flightNumber = flightNumber; }
        public String getAircraftType() { return aircraftType; }
        public void setAircraftType(String aircraftType) { this.aircraftType = aircraftType; }
        public Long getAirlineId() { return airlineId; }
        public void setAirlineId(Long airlineId) { this.airlineId = airlineId; }
        public Long getDepartureAirportId() { return departureAirportId; }
        public void setDepartureAirportId(Long departureAirportId) { this.departureAirportId = departureAirportId; }
        public Long getArrivalAirportId() { return arrivalAirportId; }
        public void setArrivalAirportId(Long arrivalAirportId) { this.arrivalAirportId = arrivalAirportId; }
        public LocalDateTime getArrivalTime() { return arrivalTime; }
        public void setArrivalTime(LocalDateTime arrivalTime) { this.arrivalTime = arrivalTime; }
        public Integer getTotalSeats() { return totalSeats; }
        public void setTotalSeats(Integer totalSeats) { this.totalSeats = totalSeats; }
        public Integer getAvailableSeats() { return availableSeats; }
        public void setAvailableSeats(Integer availableSeats) { this.availableSeats = availableSeats; }
        public BigDecimal getBaseFare() { return baseFare; }
        public void setBaseFare(BigDecimal baseFare) { this.baseFare = baseFare; }
        public LocalDateTime getDepartureTime() { return departureTime; }
        public void setDepartureTime(LocalDateTime departureTime) { this.departureTime = departureTime; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class PassengerDTO {
        private Long id;
        private Long bookingId;
        private String firstName;
        private String lastName;
        private String email;
        private String phoneNumber;
        private String passportNumber;
        private String dateOfBirth;
        private String category;
        private String gender;
        private String nationality;
        private String specialRequests;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getBookingId() { return bookingId; }
        public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        public String getPassportNumber() { return passportNumber; }
        public void setPassportNumber(String passportNumber) { this.passportNumber = passportNumber; }
        public String getDateOfBirth() { return dateOfBirth; }
        public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getGender() { return gender; }
        public void setGender(String gender) { this.gender = gender; }
        public String getNationality() { return nationality; }
        public void setNationality(String nationality) { this.nationality = nationality; }
        public String getSpecialRequests() { return specialRequests; }
        public void setSpecialRequests(String specialRequests) { this.specialRequests = specialRequests; }
    }

    public static class UserDTO {
        private String email;
        private String phoneNumber;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    }
}
