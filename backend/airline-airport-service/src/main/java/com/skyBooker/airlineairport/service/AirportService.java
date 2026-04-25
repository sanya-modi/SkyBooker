package com.skyBooker.airlineairport.service;

import com.skyBooker.airlineairport.entity.Airport;

import java.util.List;

public interface AirportService {
    Airport createAirport(Airport airport);
    Airport getAirportById(Long id);
    Airport getAirportByIataCode(String iataCode);
    List<Airport> getAllAirports();
    List<Airport> getAirportsByCity(String city);
    List<Airport> getAirportsByCountry(String country);
    Airport updateAirport(Long id, Airport airportData);
    void deleteAirport(Long id);
    List<Airport> searchCities(String searchTerm);
}
