package com.skybooker.airlineairport.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.skybooker.airlineairport.entity.Airline;
import com.skybooker.airlineairport.repository.AirlineRepository;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AirlineServiceImplTest {

    @Mock
    private AirlineRepository airlineRepository;

    @InjectMocks
    private AirlineServiceImpl airlineService;

    @Test
    void createAirline() {
        Airline airline = new Airline();
        airline.setName("Sky");

        when(airlineRepository.save(airline)).thenReturn(airline);

        Airline result = airlineService.createAirline(airline);

        assertThat(result.getName()).isEqualTo("Sky");
    }

    @Test
    void getAirlineByIdSuccess() {
        Airline airline = new Airline();
        airline.setId(1L);

        when(airlineRepository.findById(1L)).thenReturn(Optional.of(airline));

        assertThat(airlineService.getAirlineById(1L)).isNotNull();
    }

    @Test
    void getAirlineByIdThrows() {
        when(airlineRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> airlineService.getAirlineById(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Airline not found");
    }

    @Test
    void getAirlineByIataCodeSuccess() {
        Airline airline = new Airline();

        when(airlineRepository.findByIataCode("SB")).thenReturn(Optional.of(airline));

        assertThat(airlineService.getAirlineByIataCode("SB")).isNotNull();
    }

    @Test
    void getAirlineByIataCodeThrows() {
        when(airlineRepository.findByIataCode("SB")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> airlineService.getAirlineByIataCode("SB"))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void getAllAirlinesDefault() {
        when(airlineRepository.findAllActive()).thenReturn(List.of(new Airline()));

        assertThat(airlineService.getAllAirlines()).hasSize(1);
    }

    @Test
    void getAllAirlinesIncludeInactiveTrue() {
        when(airlineRepository.findAll()).thenReturn(List.of(new Airline(), new Airline()));

        assertThat(airlineService.getAllAirlines(true)).hasSize(2);
    }

    @Test
    void getAllAirlinesIncludeInactiveFalse() {
        when(airlineRepository.findAllActive()).thenReturn(List.of(new Airline()));

        assertThat(airlineService.getAllAirlines(false)).hasSize(1);
    }

    @Test
    void updateAirlinePartial() {
        Airline existing = new Airline();
        existing.setId(1L);
        existing.setName("Old");

        Airline update = new Airline();
        update.setName("New");

        when(airlineRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(airlineRepository.save(existing)).thenReturn(existing);

        Airline result = airlineService.updateAirline(1L, update);

        assertThat(result.getName()).isEqualTo("New");
    }

    @Test
    void updateAirlineNoChanges() {
        Airline existing = new Airline();
        existing.setId(1L);
        existing.setName("Same");

        Airline update = new Airline();

        when(airlineRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(airlineRepository.save(existing)).thenReturn(existing);

        Airline result = airlineService.updateAirline(1L, update);

        assertThat(result.getName()).isEqualTo("Same");
    }

    @Test
    void updateAirlineAllMutableFields() {
        Airline existing = new Airline();
        existing.setId(1L);
        existing.setName("Old");
        existing.setDescription("Old description");
        existing.setPhoneNumber("1111111111");
        existing.setEmail("old@test.com");
        existing.setIsActive(true);

        Airline update = new Airline();
        update.setName("New");
        update.setDescription("New description");
        update.setPhoneNumber("9999999999");
        update.setEmail("new@test.com");
        update.setIsActive(false);

        when(airlineRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(airlineRepository.save(existing)).thenReturn(existing);

        Airline result = airlineService.updateAirline(1L, update);

        assertThat(result.getName()).isEqualTo("New");
        assertThat(result.getDescription()).isEqualTo("New description");
        assertThat(result.getPhoneNumber()).isEqualTo("9999999999");
        assertThat(result.getEmail()).isEqualTo("new@test.com");
        assertThat(result.getIsActive()).isFalse();
    }

    @Test
    void deleteAirline() {
        Airline airline = new Airline();
        airline.setId(5L);

        when(airlineRepository.findById(5L)).thenReturn(Optional.of(airline));

        airlineService.deleteAirline(5L);

        verify(airlineRepository).delete(airline);
    }
}
