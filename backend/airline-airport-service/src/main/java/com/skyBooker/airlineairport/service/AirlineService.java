package com.skybooker.airlineairport.service;

import com.skybooker.airlineairport.entity.Airline;

import java.util.List;

public interface AirlineService {
    Airline createAirline(Airline airline);
    Airline getAirlineById(Long id);
    Airline getAirlineByIataCode(String iataCode);
    List<Airline> getAllAirlines();
    List<Airline> getAllAirlines(boolean includeInactive);
    Airline updateAirline(Long id, Airline airlineData);
    void deleteAirline(Long id);
}
