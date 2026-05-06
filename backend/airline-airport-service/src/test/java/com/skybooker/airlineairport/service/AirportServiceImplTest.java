package com.skybooker.airlineairport.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.skybooker.airlineairport.entity.Airport;
import com.skybooker.airlineairport.repository.AirportRepository;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AirportServiceImplTest {

    @Mock
    private AirportRepository airportRepository;

    @InjectMocks
    private AirportServiceImpl airportService;

    @Test
    void createAirport() {
        Airport airport = new Airport();
        airport.setName("Delhi");

        when(airportRepository.save(airport)).thenReturn(airport);

        assertThat(airportService.createAirport(airport)).isNotNull();
    }

    @Test
    void getAirportByIdSuccess() {
        Airport airport = new Airport();

        when(airportRepository.findById(1L)).thenReturn(Optional.of(airport));

        assertThat(airportService.getAirportById(1L)).isNotNull();
    }

    @Test
    void getAirportByIdThrows() {
        when(airportRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> airportService.getAirportById(1L))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void getAirportByIataSuccess() {
        Airport airport = new Airport();

        when(airportRepository.findByIataCode("DEL")).thenReturn(Optional.of(airport));

        assertThat(airportService.getAirportByIataCode("DEL")).isNotNull();
    }

    @Test
    void getAirportByIataThrows() {
        when(airportRepository.findByIataCode("DEL")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> airportService.getAirportByIataCode("DEL"))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void getAllAirportsDefault() {
        when(airportRepository.findAllActive()).thenReturn(List.of(new Airport()));

        assertThat(airportService.getAllAirports()).hasSize(1);
    }

    @Test
    void getAllAirportsIncludeInactiveTrue() {
        when(airportRepository.findAll()).thenReturn(List.of(new Airport(), new Airport()));

        assertThat(airportService.getAllAirports(true)).hasSize(2);
    }

    @Test
    void getAllAirportsIncludeInactiveFalse() {
        when(airportRepository.findAllActive()).thenReturn(List.of(new Airport()));

        assertThat(airportService.getAllAirports(false)).hasSize(1);
    }

    @Test
    void getAirportsByCity() {
        when(airportRepository.findByCity("Delhi")).thenReturn(List.of(new Airport()));

        assertThat(airportService.getAirportsByCity("Delhi")).hasSize(1);
    }

    @Test
    void getAirportsByCountry() {
        when(airportRepository.findByCountry("India")).thenReturn(List.of(new Airport()));

        assertThat(airportService.getAirportsByCountry("India")).hasSize(1);
    }

    @Test
    void updateAirportPartial() {
        Airport existing = new Airport();
        existing.setId(1L);
        existing.setName("Old");

        Airport update = new Airport();
        update.setName("New");
        update.setIsActive(false);

        when(airportRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(airportRepository.save(existing)).thenReturn(existing);

        Airport result = airportService.updateAirport(1L, update);

        assertThat(result.getName()).isEqualTo("New");
        assertThat(result.getIsActive()).isFalse();
    }

    @Test
    void updateAirportNoChanges() {
        Airport existing = new Airport();
        existing.setId(1L);
        existing.setName("Same");

        Airport update = new Airport();

        when(airportRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(airportRepository.save(existing)).thenReturn(existing);

        Airport result = airportService.updateAirport(1L, update);

        assertThat(result.getName()).isEqualTo("Same");
    }

    @Test
    void deleteAirport() {
        Airport airport = new Airport();
        airport.setId(10L);

        when(airportRepository.findById(10L)).thenReturn(Optional.of(airport));

        airportService.deleteAirport(10L);

        verify(airportRepository).delete(airport);
    }

    @Test
    void searchCities() {
        when(airportRepository.searchByCity("Del")).thenReturn(List.of(new Airport()));

        assertThat(airportService.searchCities("Del")).hasSize(1);
    }
}