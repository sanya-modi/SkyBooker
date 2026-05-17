package com.skyBooker.airlineairport.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import com.skyBooker.airlineairport.controller.AirportSearchController;
import com.skyBooker.airlineairport.entity.Airport;
import com.skyBooker.airlineairport.service.AirportService;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AirportSearchController.class)
class AirportSearchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AirportService airportService;

    @Test
    void searchAirportsReturnsEmptyListWhenQueryMissing() throws Exception {
        mockMvc.perform(get("/airports/search"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void searchAirportsReturnsEmptyListWhenQueryTooShort() throws Exception {
        mockMvc.perform(get("/airports/search").param("q", " D "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void searchAirportsReturnsRepositoryResultsForValidTerm() throws Exception {
        Airport airport = new Airport();
        airport.setName("Indira Gandhi International Airport");
        airport.setCity("Delhi");
        when(airportService.searchCities("Del")).thenReturn(List.of(airport));

        mockMvc.perform(get("/airports/search").param("q", "  Del  "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].city").value("Delhi"));

        verify(airportService).searchCities("Del");
    }
}
