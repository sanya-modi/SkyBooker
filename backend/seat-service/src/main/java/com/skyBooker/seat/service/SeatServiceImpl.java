package com.skyBooker.seat.service;

import com.skyBooker.seat.entity.Seat;
import com.skyBooker.seat.entity.SeatClassConfig;
import com.skyBooker.seat.dto.SeatClassRangeRequest;
import com.skyBooker.seat.dto.SeatMapUpdateEvent;
import com.skyBooker.seat.dto.SeatCountUpdateEvent;
import com.skyBooker.seat.dto.FlightAnalyticsEvent;
import com.skyBooker.seat.dto.SeatResponse;
import com.skyBooker.seat.repository.SeatClassConfigRepository;
import com.skyBooker.seat.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Map;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeatServiceImpl implements SeatService {

    private final SeatRepository seatRepository;
    private final SeatClassConfigRepository seatClassConfigRepository;
    private static final int SEAT_HOLD_MINUTES = 15;
    private static final String[] SEAT_LETTERS = {"A", "B", "C", "D", "E", "F"};
    private final Map<Long, List<SseEmitter>> emittersByFlight = new ConcurrentHashMap<>();
    
    @org.springframework.beans.factory.annotation.Value("${services.flight-base-url:http://localhost:8082}")
    private String flightServiceUrl;

    @org.springframework.beans.factory.annotation.Value("${services.booking-base-url:http://localhost:8084}")
    private String bookingServiceUrl;
    
    private final org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

    @Override
    @Transactional
    public void initializeSeatsForFlight(Long flightId, Integer totalSeats) {
        List<String> expectedSeatNumbers = buildSeatNumbers(totalSeats);
        Set<String> expectedSeatSet = Set.copyOf(expectedSeatNumbers);
        List<Seat> existingSeats = seatRepository.findByFlightId(flightId);
        Map<String, Seat> existingSeatsByNumber = existingSeats.stream()
                .collect(Collectors.toMap(Seat::getSeatNumber, seat -> seat, (first, ignored) -> first));

        for (String seatNumber : expectedSeatNumbers) {
            if (existingSeatsByNumber.containsKey(seatNumber)) {
                continue;
            }

            Seat seat = new Seat();
            seat.setFlightId(flightId);
            seat.setSeatNumber(seatNumber);
            seat.setSeatClass(resolveSeatClass(getRowNumber(seatNumber), seatClassConfigRepository.findByFlightIdOrderByStartRowAsc(flightId)));
            seatRepository.save(seat);
        }

        for (Seat seat : existingSeats) {
            if (!expectedSeatSet.contains(seat.getSeatNumber()) && seat.getStatus() == Seat.SeatStatus.AVAILABLE) {
                seatRepository.delete(seat);
            }
        }

        applySeatConfigToSeats(flightId);
        publishSeatUpdate(flightId, "INITIALIZED");
    }

    @Override
    @Transactional(readOnly = true)
    public List<Seat> getAllSeatsByFlight(Long flightId) {
        return seatRepository.findByFlightId(flightId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Seat> getAvailableSeats(Long flightId) {
        return seatRepository.findAvailableSeats(flightId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Seat> getAvailableSeatsByClass(Long flightId, Seat.SeatClass seatClass) {
        return seatRepository.findAvailableSeatsByClass(flightId, seatClass);
    }

    @Override
    @Transactional
    public Seat holdSeat(Long flightId, String seatNumber, Long passengerId) {
        try {
            Seat seat = seatRepository.findByFlightIdAndSeatNumberForUpdate(flightId, seatNumber)
                    .orElseThrow(() -> new RuntimeException("Seat not found: " + seatNumber + " for flight: " + flightId));

            if (seat.getStatus() == Seat.SeatStatus.HELD && passengerId.equals(seat.getPassengerId())) {
                seat.setHoldExpiresAt(LocalDateTime.now().plusMinutes(SEAT_HOLD_MINUTES));
                Seat savedSeat = seatRepository.save(seat);
                publishSeatUpdate(flightId, "HELD");
                return savedSeat;
            }

            if (seat.getStatus() != Seat.SeatStatus.AVAILABLE) {
                throw new RuntimeException("Seat is not available. Current status: " + seat.getStatus());
            }

            seat.setStatus(Seat.SeatStatus.HELD);
            seat.setPassengerId(passengerId);
            seat.setHoldExpiresAt(LocalDateTime.now().plusMinutes(SEAT_HOLD_MINUTES));
            Seat savedSeat = seatRepository.save(seat);
            publishSeatUpdate(flightId, "HELD");
            return savedSeat;
        } catch (Exception e) {
            throw new RuntimeException("Failed to hold seat: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public Seat bookSeat(Long flightId, String seatNumber, Long bookingId, Long passengerId) {
        try {
            Seat seat = seatRepository.findByFlightIdAndSeatNumberForUpdate(flightId, seatNumber)
                    .orElseThrow(() -> new RuntimeException("Seat not found: " + seatNumber + " for flight: " + flightId));

            if (seat.getStatus() == Seat.SeatStatus.BOOKED) {
                throw new RuntimeException("Seat is already booked");
            }

            if (seat.getStatus() == Seat.SeatStatus.HELD && seat.getPassengerId() != null && !seat.getPassengerId().equals(passengerId)) {
                throw new RuntimeException("Seat is held by another passenger");
            }

            if (seat.getStatus() != Seat.SeatStatus.HELD && seat.getStatus() != Seat.SeatStatus.AVAILABLE) {
                throw new RuntimeException("Seat is not available for booking. Current status: " + seat.getStatus());
            }

            seat.setStatus(Seat.SeatStatus.BOOKED);
            seat.setBookingId(bookingId);
            seat.setPassengerId(passengerId);
            seat.setHoldExpiresAt(null);
            Seat savedSeat = seatRepository.save(seat);
            publishSeatUpdate(flightId, "BOOKED");
            return savedSeat;
        } catch (Exception e) {
            throw new RuntimeException("Failed to book seat: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void releaseSeat(Long seatId) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new RuntimeException("Seat not found"));
        releaseSeatEntity(seat);
    }

    @Override
    @Transactional
    public void releaseSeat(Long flightId, String seatNumber) {
        Seat seat = seatRepository.findByFlightIdAndSeatNumber(flightId, seatNumber)
                .orElseThrow(() -> new RuntimeException("Seat not found: " + seatNumber + " for flight: " + flightId));
        releaseSeatEntity(seat);
    }

    @Override
    @Transactional(readOnly = true)
    public Seat getSeatById(Long seatId) {
        return seatRepository.findById(seatId)
                .orElseThrow(() -> new RuntimeException("Seat not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Seat> getSeatsbyBookingId(Long bookingId) {
        return seatRepository.findByBookingId(bookingId);
    }

    @Override
    @Transactional
    public void releaseExpiredHolds() {
        LocalDateTime now = LocalDateTime.now();
        List<Seat> expiredSeats = seatRepository.findExpiredHeldSeats(now);

        Set<Long> affectedFlights = expiredSeats.stream().map(Seat::getFlightId).collect(Collectors.toSet());
        expiredSeats.forEach(this::releaseSeatEntity);
        affectedFlights.forEach(flightId -> publishSeatUpdate(flightId, "RELEASED"));
    }

    @Scheduled(fixedDelayString = "${seat.hold.release.scheduler-ms:120000}")
    public void scheduledReleaseExpiredHolds() {
        releaseExpiredHolds();
    }

    @Override
    @Transactional
    public List<SeatClassConfig> saveSeatConfig(Long flightId, List<SeatClassRangeRequest> ranges) {
        validateRanges(ranges);

        seatClassConfigRepository.deleteByFlightId(flightId);

        List<SeatClassConfig> saved = ranges.stream()
                .sorted(Comparator.comparingInt(SeatClassRangeRequest::getStartRow))
                .map(range -> {
                    SeatClassConfig config = new SeatClassConfig();
                    config.setFlightId(flightId);
                    config.setStartRow(range.getStartRow());
                    config.setEndRow(range.getEndRow());
                    config.setSeatClass(range.getSeatClass());
                    return seatClassConfigRepository.save(config);
                })
                .toList();

        applySeatConfigToSeats(flightId);
        publishSeatUpdate(flightId, "CONFIG_UPDATED");
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SeatClassConfig> getSeatConfig(Long flightId) {
        return seatClassConfigRepository.findByFlightIdOrderByStartRowAsc(flightId);
    }

    @Override
    @Transactional(readOnly = true)
    public SseEmitter subscribeToFlightSeatMap(Long flightId) {
        List<Seat> allSeats = getAllSeatsByFlight(flightId);
        List<SeatResponse> seats = allSeats.stream().map(this::mapToResponse).toList();
        List<com.skyBooker.seat.dto.SeatClassConfigResponse> configs = getSeatConfig(flightId).stream().map(this::mapConfigToResponse).toList();
        
        SseEmitter emitter = new SseEmitter(0L);
        emittersByFlight.computeIfAbsent(flightId, ignored -> new ArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(flightId, emitter));
        emitter.onTimeout(() -> removeEmitter(flightId, emitter));
        emitter.onError(ignored -> removeEmitter(flightId, emitter));

        // Send initial snapshot
        sendEvent(emitter, new SeatMapUpdateEvent(
                flightId,
                "SNAPSHOT",
                LocalDateTime.now(),
                seats,
                configs
        ));
        
        // Send initial seat count
        int totalSeats = allSeats.size();
        int bookedSeats = (int) allSeats.stream().filter(s -> s.getStatus() == Seat.SeatStatus.BOOKED).count();
        int availableSeats = (int) allSeats.stream().filter(s -> s.getStatus() == Seat.SeatStatus.AVAILABLE).count();
        
        sendCountEvent(emitter, new SeatCountUpdateEvent(
                flightId,
                totalSeats,
                bookedSeats,
                availableSeats
        ));
        
        // Send initial analytics asynchronously to avoid blocking
        try {
            sendAnalyticsEvent(emitter, buildAnalyticsEvent(flightId, allSeats));
        } catch (Exception e) {
            log.warn("Failed to send initial analytics for flight {}: {}", flightId, e.getMessage());
        }

        return emitter;
    }
    private void removeEmitter(Long flightId, SseEmitter emitter) {
        Optional.ofNullable(emittersByFlight.get(flightId)).ifPresent(emitters -> emitters.remove(emitter));
    }

    public void publishSeatUpdate(Long flightId, String eventType) {
        log.info("publishSeatUpdate called for flight {} with event type {}", flightId, eventType);
        List<Seat> allSeats = getAllSeatsByFlight(flightId);
        int totalSeats = allSeats.size();
        int bookedSeats = (int) allSeats.stream().filter(s -> s.getStatus() == Seat.SeatStatus.BOOKED).count();
        int availableSeats = (int) allSeats.stream().filter(s -> s.getStatus() == Seat.SeatStatus.AVAILABLE).count();
        
        log.info("Flight {} stats: total={}, booked={}, available={}", flightId, totalSeats, bookedSeats, availableSeats);
        updateFlightAvailableSeats(flightId, availableSeats);
        
        List<SseEmitter> emitters = emittersByFlight.get(flightId);
        if (emitters == null || emitters.isEmpty()) {
            log.info("No SSE emitters for flight {}, skipping event broadcast", flightId);
            return;
        }

        List<SeatResponse> seats = allSeats.stream().map(this::mapToResponse).toList();
        List<com.skyBooker.seat.dto.SeatClassConfigResponse> configs = getSeatConfig(flightId).stream().map(this::mapConfigToResponse).toList();

        SeatMapUpdateEvent event = new SeatMapUpdateEvent(
                flightId,
                eventType,
                LocalDateTime.now(),
                seats,
                configs
        );
        
        SeatCountUpdateEvent countEvent = new SeatCountUpdateEvent(
                flightId,
                totalSeats,
                bookedSeats,
                availableSeats
        );

        List<SseEmitter> staleEmitters = new ArrayList<>();
        List<SseEmitter> emittersCopy = new ArrayList<>(emitters);
        for (SseEmitter emitter : emittersCopy) {
            try {
                sendEvent(emitter, event);
                sendCountEvent(emitter, countEvent);
                // Send analytics asynchronously to avoid blocking
                try {
                    FlightAnalyticsEvent analyticsEvent = buildAnalyticsEvent(flightId, allSeats);
                    sendAnalyticsEvent(emitter, analyticsEvent);
                } catch (Exception e) {
                    log.warn("Failed to send analytics for flight {}: {}", flightId, e.getMessage());
                }
            } catch (Exception exception) {
                staleEmitters.add(emitter);
            }
        }
        emitters.removeAll(staleEmitters);
        log.info("Published SSE events to {} emitters for flight {}", emittersCopy.size() - staleEmitters.size(), flightId);
    }

    private void sendEvent(SseEmitter emitter, SeatMapUpdateEvent event) {
        try {
            emitter.send(SseEmitter.event().name("seat-map").data(event));
        } catch (Exception exception) {
            emitter.completeWithError(exception);
        }
    }

    private void sendCountEvent(SseEmitter emitter, SeatCountUpdateEvent event) {
        try {
            emitter.send(SseEmitter.event().name("seat-count").data(event));
        } catch (Exception exception) {
            emitter.completeWithError(exception);
        }
    }
    
    private void sendAnalyticsEvent(SseEmitter emitter, FlightAnalyticsEvent event) {
        try {
            emitter.send(SseEmitter.event().name("flight-analytics").data(event));
        } catch (Exception exception) {
            emitter.completeWithError(exception);
        }
    }
    
    private FlightAnalyticsEvent buildAnalyticsEvent(Long flightId, List<Seat> allSeats) {
        int totalSeats = allSeats.size();
        int bookedSeats = (int) allSeats.stream().filter(s -> s.getStatus() == Seat.SeatStatus.BOOKED).count();
        int availableSeats = (int) allSeats.stream().filter(s -> s.getStatus() == Seat.SeatStatus.AVAILABLE).count();

        BookingAnalyticsDTO bookingAnalytics = getBookingAnalytics(flightId);
        java.math.BigDecimal revenue = bookingAnalytics != null && bookingAnalytics.getRevenue() != null
                ? bookingAnalytics.getRevenue()
                : java.math.BigDecimal.ZERO;
        Integer bookingsCount = bookingAnalytics != null && bookingAnalytics.getBookingsCount() != null
                ? bookingAnalytics.getBookingsCount().intValue()
                : (int) allSeats.stream()
                    .filter(s -> s.getBookingId() != null)
                    .map(Seat::getBookingId)
                    .collect(Collectors.toSet())
                    .size();
        
        return new FlightAnalyticsEvent(
                flightId,
                totalSeats,
                bookedSeats,
                availableSeats,
                revenue,
                bookingsCount
        );
    }

    private BookingAnalyticsDTO getBookingAnalytics(Long flightId) {
        try {
            String url = bookingServiceUrl + "/bookings/flight/" + flightId + "/analytics";
            log.debug("Fetching booking analytics from: {}", url);
            return restTemplate.getForObject(url, BookingAnalyticsDTO.class);
        } catch (Exception e) {
            log.warn("Failed to fetch booking analytics for flight {}: {}", flightId, e.getMessage());
            return null;
        }
    }
    
    private void updateFlightAvailableSeats(Long flightId, int availableSeats) {
        try {
            String url = flightServiceUrl + "/flights/" + flightId + "/available-seats?count=" + availableSeats;
            restTemplate.put(url, null);
            log.info("Updated flight {} available seats to {}", flightId, availableSeats);
        } catch (Exception e) {
            log.error("Failed to update flight available seats for flight {}: {}", flightId, e.getMessage());
        }
    }

    private void releaseSeatEntity(Seat seat) {
        log.info("Releasing seat {} for flight {} (bookingId: {}, status: {})", 
                seat.getSeatNumber(), seat.getFlightId(), seat.getBookingId(), seat.getStatus());
        Long flightId = seat.getFlightId();
        seat.setStatus(Seat.SeatStatus.AVAILABLE);
        seat.setPassengerId(null);
        seat.setBookingId(null);
        seat.setHoldExpiresAt(null);
        seatRepository.save(seat);
        seatRepository.flush(); // Ensure changes are written to database
        log.info("Seat {} released successfully", seat.getSeatNumber());
        publishSeatUpdate(flightId, "RELEASED");
    }

    private void validateRanges(List<SeatClassRangeRequest> ranges) {
        List<SeatClassRangeRequest> ordered = ranges.stream()
                .sorted(Comparator.comparingInt(SeatClassRangeRequest::getStartRow))
                .toList();

        int previousEnd = 0;
        for (SeatClassRangeRequest range : ordered) {
            if (range.getEndRow() < range.getStartRow()) {
                throw new RuntimeException("endRow must be greater than or equal to startRow");
            }
            if (range.getStartRow() <= previousEnd) {
                throw new RuntimeException("Seat class row ranges cannot overlap");
            }
            previousEnd = range.getEndRow();
        }
    }

    private void applySeatConfigToSeats(Long flightId) {
        List<SeatClassConfig> configs = seatClassConfigRepository.findByFlightIdOrderByStartRowAsc(flightId);
        List<Seat> seats = seatRepository.findByFlightId(flightId);
        for (Seat seat : seats) {
            Seat.SeatClass resolvedClass = resolveSeatClass(getRowNumber(seat.getSeatNumber()), configs);
            if (seat.getSeatClass() != resolvedClass) {
                seat.setSeatClass(resolvedClass);
                seatRepository.save(seat);
            }
        }
    }

    private Seat.SeatClass resolveSeatClass(int rowNumber, List<SeatClassConfig> configs) {
        return configs.stream()
                .filter(config -> rowNumber >= config.getStartRow() && rowNumber <= config.getEndRow())
                .map(SeatClassConfig::getSeatClass)
                .findFirst()
                .orElse(Seat.SeatClass.ECONOMY);
    }

    private List<String> buildSeatNumbers(Integer totalSeats) {
        List<String> seatNumbers = new ArrayList<>();
        int row = 1;
        while (seatNumbers.size() < totalSeats) {
            for (String seatLetter : SEAT_LETTERS) {
                if (seatNumbers.size() >= totalSeats) {
                    break;
                }
                seatNumbers.add(row + seatLetter);
            }
            row++;
        }
        return seatNumbers;
    }

    private int getRowNumber(String seatNumber) {
        return Integer.parseInt(seatNumber.replaceAll("[^0-9]", ""));
    }

    private SeatResponse mapToResponse(Seat seat) {
        return new SeatResponse(
                seat.getId(),
                seat.getFlightId(),
                seat.getSeatNumber(),
                seat.getSeatClass(),
                seat.getStatus(),
                seat.getPassengerId(),
                seat.getBookingId(),
                seat.getHoldExpiresAt(),
                seat.getCreatedAt(),
                seat.getUpdatedAt()
        );
    }

    private com.skyBooker.seat.dto.SeatClassConfigResponse mapConfigToResponse(SeatClassConfig config) {
        return new com.skyBooker.seat.dto.SeatClassConfigResponse(
                config.getId(),
                config.getFlightId(),
                config.getStartRow(),
                config.getEndRow(),
                config.getSeatClass()
        );
    }
    
    private static class BookingAnalyticsDTO {
        private Long bookingsCount;
        private java.math.BigDecimal revenue;

        public Long getBookingsCount() {
            return bookingsCount;
        }

        public void setBookingsCount(Long bookingsCount) {
            this.bookingsCount = bookingsCount;
        }

        public java.math.BigDecimal getRevenue() {
            return revenue;
        }

        public void setRevenue(java.math.BigDecimal revenue) {
            this.revenue = revenue;
        }
    }
}
