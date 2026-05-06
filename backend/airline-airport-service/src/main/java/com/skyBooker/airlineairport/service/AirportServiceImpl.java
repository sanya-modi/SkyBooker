package com.skybooker.airlineairport.service;

import com.skybooker.airlineairport.entity.Airport;
import com.skybooker.airlineairport.repository.AirportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AirportServiceImpl implements AirportService {

    private final AirportRepository airportRepository;

    @Override
    public Airport createAirport(Airport airport) {
        return airportRepository.save(airport);
    }

    @Override
    @Transactional(readOnly = true)
    public Airport getAirportById(Long id) {
        return airportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Airport not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public Airport getAirportByIataCode(String iataCode) {
        return airportRepository.findByIataCode(iataCode)
                .orElseThrow(() -> new RuntimeException("Airport not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Airport> getAllAirports() {
        return airportRepository.findAllActive();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Airport> getAllAirports(boolean includeInactive) {
        return includeInactive ? airportRepository.findAll() : airportRepository.findAllActive();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Airport> getAirportsByCity(String city) {
        return airportRepository.findByCity(city);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Airport> getAirportsByCountry(String country) {
        return airportRepository.findByCountry(country);
    }

    @Override
    public Airport updateAirport(Long id, Airport airportData) {
        Airport airport = getAirportById(id);
        if (airportData.getName() != null) {
            airport.setName(airportData.getName());
        }
        if (airportData.getDescription() != null) {
            airport.setDescription(airportData.getDescription());
        }
        if (airportData.getPhoneNumber() != null) {
            airport.setPhoneNumber(airportData.getPhoneNumber());
        }
        if (airportData.getEmail() != null) {
            airport.setEmail(airportData.getEmail());
        }
        if (airportData.getIsActive() != null) {
            airport.setIsActive(airportData.getIsActive());
        }
        return airportRepository.save(airport);
    }

    @Override
    public void deleteAirport(Long id) {
        Airport airport = getAirportById(id);
        airportRepository.delete(airport);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Airport> searchCities(String searchTerm) {
        return airportRepository.searchByCity(searchTerm);
    }
}
