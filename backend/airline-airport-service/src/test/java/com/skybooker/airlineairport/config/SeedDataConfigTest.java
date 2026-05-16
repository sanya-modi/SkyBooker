package com.skyBooker.airlineairport.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.CommandLineRunner;

import com.skyBooker.airlineairport.config.SeedDataConfig;
import com.skyBooker.airlineairport.config.WebConfig;
import com.skyBooker.airlineairport.entity.Airline;
import com.skyBooker.airlineairport.entity.Airport;
import com.skyBooker.airlineairport.repository.AirlineRepository;
import com.skyBooker.airlineairport.repository.AirportRepository;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SeedDataConfigTest {

    private final SeedDataConfig seedDataConfig = new SeedDataConfig();

    @Test
    void seedAirportsAndAirlinesSavesMissingRecords() throws Exception {
        AirlineRepository airlineRepository = org.mockito.Mockito.mock(AirlineRepository.class);
        AirportRepository airportRepository = org.mockito.Mockito.mock(AirportRepository.class);
        when(airlineRepository.findByIataCode(any())).thenReturn(Optional.empty());
        when(airportRepository.findByIataCode(any())).thenReturn(Optional.empty());

        CommandLineRunner runner = seedDataConfig.seedAirportsAndAirlines(airlineRepository, airportRepository);
        runner.run();

        verify(airlineRepository, times(5)).save(any(Airline.class));
        verify(airportRepository, times(12)).save(any(Airport.class));
    }

    @Test
    void seedAirportsAndAirlinesSkipsExistingRecords() throws Exception {
        AirlineRepository airlineRepository = org.mockito.Mockito.mock(AirlineRepository.class);
        AirportRepository airportRepository = org.mockito.Mockito.mock(AirportRepository.class);
        when(airlineRepository.findByIataCode(any())).thenReturn(Optional.of(new Airline()));
        when(airportRepository.findByIataCode(any())).thenReturn(Optional.of(new Airport()));

        CommandLineRunner runner = seedDataConfig.seedAirportsAndAirlines(airlineRepository, airportRepository);
        runner.run();

        verify(airlineRepository, never()).save(any(Airline.class));
        verify(airportRepository, never()).save(any(Airport.class));
    }

    @Test
    void webConfigCanBeInstantiated() {
        assertThat(new WebConfig()).isNotNull();
    }
}
