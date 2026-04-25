package com.skyBooker.airlineairport.repository;

import com.skyBooker.airlineairport.entity.Airline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AirlineRepository extends JpaRepository<Airline, Long> {
    Optional<Airline> findByIataCode(String iataCode);
    Optional<Airline> findByName(String name);
}
