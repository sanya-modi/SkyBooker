package com.skyBooker.seat.service;

import com.skyBooker.seat.entity.Seat;
import com.skyBooker.seat.entity.SeatClassConfig;
import com.skyBooker.seat.dto.SeatClassRangeRequest;
import com.skyBooker.seat.dto.SeatMapUpdateEvent;
import com.skyBooker.seat.dto.SeatResponse;
import com.skyBooker.seat.repository.SeatClassConfigRepository;
import com.skyBooker.seat.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
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
public class SeatServiceImpl implements SeatService {

    private final SeatRepository seatRepository;
    private final SeatClassConfigRepository seatClassConfigRepository;
    private static final int SEAT_HOLD_MINUTES = 15;
    private static final String[] SEAT_LETTERS = {"A", "B", "C", "D", "E", "F"};
    private final Map<Long, List<SseEmitter>> emittersByFlight = new ConcurrentHashMap<>();

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
        Seat seat = seatRepository.findByFlightIdAndSeatNumberForUpdate(flightId, seatNumber)
                .orElseThrow(() -> new RuntimeException("Seat not found"));

        if (seat.getStatus() == Seat.SeatStatus.HELD && passengerId.equals(seat.getPassengerId())) {
            seat.setHoldExpiresAt(LocalDateTime.now().plusMinutes(SEAT_HOLD_MINUTES));
            Seat savedSeat = seatRepository.save(seat);
            publishSeatUpdate(flightId, "HELD");
            return savedSeat;
        }

        if (seat.getStatus() != Seat.SeatStatus.AVAILABLE) {
            throw new RuntimeException("Seat is not available");
        }

        seat.setStatus(Seat.SeatStatus.HELD);
        seat.setPassengerId(passengerId);
        seat.setHoldExpiresAt(LocalDateTime.now().plusMinutes(SEAT_HOLD_MINUTES));
        Seat savedSeat = seatRepository.save(seat);
        publishSeatUpdate(flightId, "HELD");
        return savedSeat;
    }

    @Override
    @Transactional
    public Seat bookSeat(Long flightId, String seatNumber, Long bookingId, Long passengerId) {
        Seat seat = seatRepository.findByFlightIdAndSeatNumberForUpdate(flightId, seatNumber)
                .orElseThrow(() -> new RuntimeException("Seat not found"));

        if (seat.getStatus() == Seat.SeatStatus.BOOKED) {
            throw new RuntimeException("Seat is already booked");
        }

        if (seat.getStatus() == Seat.SeatStatus.HELD && seat.getPassengerId() != null && !seat.getPassengerId().equals(passengerId)) {
            throw new RuntimeException("Seat is held by another passenger");
        }

        if (seat.getStatus() != Seat.SeatStatus.HELD && seat.getStatus() != Seat.SeatStatus.AVAILABLE) {
            throw new RuntimeException("Seat is not available for booking");
        }

        seat.setStatus(Seat.SeatStatus.BOOKED);
        seat.setBookingId(bookingId);
        seat.setPassengerId(passengerId);
        seat.setHoldExpiresAt(null);
        Seat savedSeat = seatRepository.save(seat);
        publishSeatUpdate(flightId, "BOOKED");
        return savedSeat;
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
                .orElseThrow(() -> new RuntimeException("Seat not found"));
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
        List<SeatResponse> seats = getAllSeatsByFlight(flightId).stream().map(this::mapToResponse).toList();
        List<com.skyBooker.seat.dto.SeatClassConfigResponse> configs = getSeatConfig(flightId).stream().map(this::mapConfigToResponse).toList();
        
        SseEmitter emitter = new SseEmitter(0L);
        emittersByFlight.computeIfAbsent(flightId, ignored -> new ArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(flightId, emitter));
        emitter.onTimeout(() -> removeEmitter(flightId, emitter));
        emitter.onError(ignored -> removeEmitter(flightId, emitter));

        sendEvent(emitter, new SeatMapUpdateEvent(
                flightId,
                "SNAPSHOT",
                LocalDateTime.now(),
                seats,
                configs
        ));

        return emitter;
    }
    private void removeEmitter(Long flightId, SseEmitter emitter) {
        Optional.ofNullable(emittersByFlight.get(flightId)).ifPresent(emitters -> emitters.remove(emitter));
    }

    @Transactional
    public void publishSeatUpdate(Long flightId, String eventType) {
        List<SseEmitter> emitters = emittersByFlight.get(flightId);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }

        List<SeatResponse> seats = getAllSeatsByFlight(flightId).stream().map(this::mapToResponse).toList();
        List<com.skyBooker.seat.dto.SeatClassConfigResponse> configs = getSeatConfig(flightId).stream().map(this::mapConfigToResponse).toList();

        SeatMapUpdateEvent event = new SeatMapUpdateEvent(
                flightId,
                eventType,
                LocalDateTime.now(),
                seats,
                configs
        );

        List<SseEmitter> staleEmitters = new ArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                sendEvent(emitter, event);
            } catch (Exception exception) {
                staleEmitters.add(emitter);
            }
        }
        emitters.removeAll(staleEmitters);
    }

    private void sendEvent(SseEmitter emitter, SeatMapUpdateEvent event) {
        try {
            emitter.send(SseEmitter.event().name("seat-map").data(event));
        } catch (Exception exception) {
            emitter.completeWithError(exception);
        }
    }

    private void releaseSeatEntity(Seat seat) {
        seat.setStatus(Seat.SeatStatus.AVAILABLE);
        seat.setPassengerId(null);
        seat.setBookingId(null);
        seat.setHoldExpiresAt(null);
        seatRepository.save(seat);
        publishSeatUpdate(seat.getFlightId(), "RELEASED");
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
}

