package com.skyBooker.flight.repository;

import com.skyBooker.flight.entity.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Long> {
    Optional<Flight> findByFlightNumber(String flightNumber);

    @Query("SELECT f FROM Flight f WHERE f.departureAirportId = :departureAirportId AND f.arrivalAirportId = :arrivalAirportId AND DATE(f.departureTime) = DATE(:departureDate) AND f.status IN ('ON_TIME', 'DELAYED')")
    List<Flight> findAvailableFlights(@Param("departureAirportId") Long departureAirportId,
                                      @Param("arrivalAirportId") Long arrivalAirportId,
                                      @Param("departureDate") LocalDateTime departureDate);

    @Query("SELECT f FROM Flight f WHERE f.airlineId = :airlineId")
    List<Flight> findByAirlineId(@Param("airlineId") Long airlineId);

    List<Flight> findByDepartureTimeBetweenOrderByDepartureTimeAsc(LocalDateTime start, LocalDateTime end);

    @Query("SELECT f FROM Flight f WHERE f.departureAirportId = :departureAirportId AND f.arrivalAirportId = :arrivalAirportId AND DATE(f.departureTime) = :departureDate AND f.baseFare >= :minPrice AND f.baseFare <= :maxPrice AND f.status IN ('ON_TIME', 'DELAYED')")
    List<Flight> findFlightsWithPriceFilter(@Param("departureAirportId") Long departureAirportId,
                                           @Param("arrivalAirportId") Long arrivalAirportId,
                                           @Param("departureDate") LocalDate departureDate,
                                           @Param("minPrice") BigDecimal minPrice,
                                           @Param("maxPrice") BigDecimal maxPrice);

    @Query("SELECT f FROM Flight f WHERE f.departureAirportId = :departureAirportId AND f.arrivalAirportId = :arrivalAirportId AND DATE(f.departureTime) BETWEEN :startTime AND :endTime AND f.status IN ('ON_TIME', 'DELAYED')")
    List<Flight> findFlightsByTimeRange(@Param("departureAirportId") Long departureAirportId,
                                       @Param("arrivalAirportId") Long arrivalAirportId,
                                       @Param("startTime") LocalDate startTime,
                                       @Param("endTime") LocalDate endTime);

    @Query("SELECT f FROM Flight f " +
            "WHERE f.departureAirportId = :departureId " +
            "AND f.arrivalAirportId = :arrivalId " +
            "AND f.departureTime BETWEEN :start AND :end")
    List<Flight> searchFlights(
            @Param("departureId") Long departureId,
            @Param("arrivalId") Long arrivalId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

}
