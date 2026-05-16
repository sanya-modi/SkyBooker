package com.skyBooker.airlineairport.repository;

import com.skyBooker.airlineairport.entity.Airline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AirlineRepository extends JpaRepository<Airline, Long> {
    Optional<Airline> findByIataCode(String iataCode);
    Optional<Airline> findByName(String name);
    
    @Query("SELECT a FROM Airline a WHERE a.isActive = true")
    List<Airline> findAllActive();
}
