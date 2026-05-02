package com.skyBooker.airlineairport.repository;

import com.skyBooker.airlineairport.entity.Airport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AirportRepository extends JpaRepository<Airport, Long> {
    Optional<Airport> findByIataCode(String iataCode);

    @Query("SELECT a FROM Airport a WHERE a.city = :city AND a.isActive = true")
    List<Airport> findByCity(@Param("city") String city);

    @Query("SELECT a FROM Airport a WHERE a.country = :country AND a.isActive = true")
    List<Airport> findByCountry(@Param("country") String country);

    @Query("SELECT a FROM Airport a WHERE (LOWER(a.city) LIKE LOWER(CONCAT('%', :citySearchTerm, '%')) OR LOWER(a.name) LIKE LOWER(CONCAT('%', :citySearchTerm, '%')) OR LOWER(a.iataCode) LIKE LOWER(CONCAT('%', :citySearchTerm, '%'))) AND a.isActive = true")
    List<Airport> searchByCity(@Param("citySearchTerm") String citySearchTerm);

    @Query("SELECT a FROM Airport a WHERE a.isActive = true")
    List<Airport> findAllActive();
}
