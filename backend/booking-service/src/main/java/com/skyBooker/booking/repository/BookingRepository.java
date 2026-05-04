package com.skyBooker.booking.repository;

import com.skyBooker.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByPnr(String pnr);
    List<Booking> findByStatus(Booking.BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.userId = :userId ORDER BY b.bookingDate DESC")
    List<Booking> findByUserId(@Param("userId") Long userId);

    @Query("SELECT b FROM Booking b WHERE b.flightId = :flightId AND b.status = 'CONFIRMED'")
    List<Booking> findConfirmedBookingsByFlight(@Param("flightId") Long flightId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.flightId = :flightId AND b.status = 'CONFIRMED'")
    Long countConfirmedBookingsByFlight(@Param("flightId") Long flightId);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.flightId = :flightId AND b.status = 'CONFIRMED'")
    java.math.BigDecimal sumConfirmedRevenueByFlight(@Param("flightId") Long flightId);
}
