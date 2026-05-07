package com.skyBooker.passenger.repository;

import com.skyBooker.passenger.entity.Passenger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PassengerRepository extends JpaRepository<Passenger, Long> {

    @Query("SELECT p FROM Passenger p WHERE p.bookingId = :bookingId")
    List<Passenger> findByBookingId(@Param("bookingId") Long bookingId);

    @Query("SELECT p FROM Passenger p WHERE p.passportNumber = :passportNumber")
    Passenger findByPassportNumber(@Param("passportNumber") String passportNumber);

    Optional<Passenger> findByEmail(String email);
}
