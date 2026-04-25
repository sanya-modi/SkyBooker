package com.skyBooker.seat.repository;

import com.skyBooker.seat.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {
    Optional<Seat> findByFlightIdAndSeatNumber(Long flightId, String seatNumber);

    @Query("SELECT s FROM Seat s WHERE s.flightId = :flightId ORDER BY s.seatNumber")
    List<Seat> findByFlightId(@Param("flightId") Long flightId);

    @Query("SELECT s FROM Seat s WHERE s.flightId = :flightId AND s.status = 'AVAILABLE'")
    List<Seat> findAvailableSeats(@Param("flightId") Long flightId);

    @Query("SELECT COUNT(s) FROM Seat s WHERE s.flightId = :flightId AND s.status = 'BOOKED'")
    Long countBookedSeats(@Param("flightId") Long flightId);

    @Query("SELECT s FROM Seat s WHERE s.bookingId = :bookingId")
    List<Seat> findByBookingId(@Param("bookingId") Long bookingId);

    @Query("SELECT s FROM Seat s WHERE s.flightId = :flightId AND s.seatClass = :seatClass AND s.status = 'AVAILABLE'")
    List<Seat> findAvailableSeatsByClass(@Param("flightId") Long flightId, @Param("seatClass") Seat.SeatClass seatClass);

    @Query("SELECT s FROM Seat s WHERE s.status = 'HELD' AND s.holdExpiresAt IS NOT NULL AND s.holdExpiresAt <= :now")
    List<Seat> findExpiredHeldSeats(@Param("now") LocalDateTime now);
}
