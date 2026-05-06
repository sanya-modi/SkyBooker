package com.skybooker.airlineairport.service;

import com.skybooker.airlineairport.entity.Airline;
import com.skybooker.airlineairport.repository.AirlineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AirlineServiceImpl implements AirlineService {

    private final AirlineRepository airlineRepository;

    @Override
    public Airline createAirline(Airline airline) {
        return airlineRepository.save(airline);
    }

    @Override
    @Transactional(readOnly = true)
    public Airline getAirlineById(Long id) {
        return airlineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Airline not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public Airline getAirlineByIataCode(String iataCode) {
        return airlineRepository.findByIataCode(iataCode)
                .orElseThrow(() -> new RuntimeException("Airline not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Airline> getAllAirlines() {
        return airlineRepository.findAllActive();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Airline> getAllAirlines(boolean includeInactive) {
        return includeInactive ? airlineRepository.findAll() : airlineRepository.findAllActive();
    }

    @Override
    public Airline updateAirline(Long id, Airline airlineData) {
        Airline airline = getAirlineById(id);
        if (airlineData.getName() != null) {
            airline.setName(airlineData.getName());
        }
        if (airlineData.getDescription() != null) {
            airline.setDescription(airlineData.getDescription());
        }
        if (airlineData.getPhoneNumber() != null) {
            airline.setPhoneNumber(airlineData.getPhoneNumber());
        }
        if (airlineData.getEmail() != null) {
            airline.setEmail(airlineData.getEmail());
        }
        if (airlineData.getIsActive() != null) {
            airline.setIsActive(airlineData.getIsActive());
        }
        return airlineRepository.save(airline);
    }

    @Override
    public void deleteAirline(Long id) {
        Airline airline = getAirlineById(id);
        airlineRepository.delete(airline);
    }
}
