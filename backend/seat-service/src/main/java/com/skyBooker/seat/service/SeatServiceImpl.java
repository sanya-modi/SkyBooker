package com.skyBooker.seat.service;

import com.skyBooker.seat.entity.Seat;
import com.skyBooker.seat.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SeatServiceImpl implements SeatService {

    private final SeatRepository seatRepository;
    private static final int SEAT_HOLD_MINUTES = 15;

    @Override
    public void initializeSeatsForFlight(Long flightId, Integer totalSeats) {
        int seatsPerRow = 6;
        String[] seatLetters = {"A", "B", "C", "D", "E", "F"};
        int economyRows = (int) Math.ceil(totalSeats * 0.70 / seatsPerRow);
        int businessRows = (int) Math.ceil(totalSeats * 0.20 / seatsPerRow);

        List<Seat> existingSeats = seatRepository.findByFlightId(flightId);
        java.util.Set<String> existingSeatNumbers = existingSeats.stream()
                .map(Seat::getSeatNumber)
                .collect(java.util.stream.Collectors.toSet());

        int seatCount = 0;

        for (int row = 1; row <= economyRows && seatCount < totalSeats; row++) {
            for (String letter : seatLetters) {
                if (seatCount < totalSeats) {
                    String seatNum = row + letter;
                    if (!existingSeatNumbers.contains(seatNum)) {
                        Seat seat = new Seat();
                        seat.setFlightId(flightId);
                        seat.setSeatNumber(seatNum);
                        seat.setSeatClass(Seat.SeatClass.ECONOMY);
                        seatRepository.save(seat);
                    }
                    seatCount++;
                }
            }
        }

        for (int row = economyRows + 1; row <= economyRows + businessRows && seatCount < totalSeats; row++) {
            for (String letter : seatLetters) {
                if (seatCount < totalSeats) {
                    String seatNum = row + letter;
                    if (!existingSeatNumbers.contains(seatNum)) {
                        Seat seat = new Seat();
                        seat.setFlightId(flightId);
                        seat.setSeatNumber(seatNum);
                        seat.setSeatClass(Seat.SeatClass.BUSINESS);
                        seatRepository.save(seat);
                    }
                    seatCount++;
                }
            }
        }
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
    public Seat holdSeat(Long flightId, String seatNumber, Long passengerId) {
        Seat seat = seatRepository.findByFlightIdAndSeatNumber(flightId, seatNumber)
                .orElseThrow(() -> new RuntimeException("Seat not found"));

        if (seat.getStatus() != Seat.SeatStatus.AVAILABLE) {
            throw new RuntimeException("Seat is not available");
        }

        seat.setStatus(Seat.SeatStatus.HELD);
        seat.setPassengerId(passengerId);
        seat.setHoldExpiresAt(LocalDateTime.now().plusMinutes(SEAT_HOLD_MINUTES));
        return seatRepository.save(seat);
    }

    @Override
    public Seat bookSeat(Long flightId, String seatNumber, Long bookingId, Long passengerId) {
        Seat seat = seatRepository.findByFlightIdAndSeatNumber(flightId, seatNumber)
                .orElseThrow(() -> new RuntimeException("Seat not found"));

        if (seat.getStatus() != Seat.SeatStatus.HELD && seat.getStatus() != Seat.SeatStatus.AVAILABLE) {
            throw new RuntimeException("Seat is not available for booking");
        }

        seat.setStatus(Seat.SeatStatus.BOOKED);
        seat.setBookingId(bookingId);
        seat.setPassengerId(passengerId);
        seat.setHoldExpiresAt(null);
        return seatRepository.save(seat);
    }

    @Override
    public void releaseSeat(Long seatId) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new RuntimeException("Seat not found"));

        seat.setStatus(Seat.SeatStatus.AVAILABLE);
        seat.setPassengerId(null);
        seat.setBookingId(null);
        seat.setHoldExpiresAt(null);
        seatRepository.save(seat);
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
    public void releaseExpiredHolds() {
        LocalDateTime now = LocalDateTime.now();
        List<Seat> expiredSeats = seatRepository.findExpiredHeldSeats(now);

        expiredSeats.forEach(seat -> {
            seat.setStatus(Seat.SeatStatus.AVAILABLE);
            seat.setPassengerId(null);
            seat.setBookingId(null);
            seat.setHoldExpiresAt(null);
            seatRepository.save(seat);
        });
    }

    @Scheduled(fixedDelayString = "${seat.hold.release.scheduler-ms:120000}")
    public void scheduledReleaseExpiredHolds() {
        releaseExpiredHolds();
    }
}
