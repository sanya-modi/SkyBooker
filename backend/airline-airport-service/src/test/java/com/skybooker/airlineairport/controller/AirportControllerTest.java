package com.skyBooker.airlineairport.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skyBooker.airlineairport.controller.AirportController;
import com.skyBooker.airlineairport.dto.AirportRequest;
import com.skyBooker.airlineairport.entity.Airport;
import com.skyBooker.airlineairport.service.AirportService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AirportController.class)
class AirportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AirportService airportService;

    @Test
    void createAirportReturnsCreatedResponse() throws Exception {
        when(airportService.createAirport(any(Airport.class))).thenReturn(sampleAirport(true));

        mockMvc.perform(post("/airports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.iataCode").value("DEL"))
                .andExpect(jsonPath("$.city").value("Delhi"));
    }

    @Test
    void getAirportByIdReturnsResponse() throws Exception {
        when(airportService.getAirportById(1L)).thenReturn(sampleAirport(true));

        mockMvc.perform(get("/airports/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.country").value("India"));
    }

    @Test
    void getAirportByIataCodeReturnsResponse() throws Exception {
        when(airportService.getAirportByIataCode("DEL")).thenReturn(sampleAirport(true));

        mockMvc.perform(get("/airports/iata/DEL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Indira Gandhi International Airport"));
    }

    @Test
    void getAllAirportsPassesIncludeInactiveFlag() throws Exception {
        when(airportService.getAllAirports(true)).thenReturn(List.of(sampleAirport(true)));

        mockMvc.perform(get("/airports").param("includeInactive", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].iataCode").value("DEL"));

        verify(airportService).getAllAirports(true);
    }

    @Test
    void getAirportsByCityReturnsResponse() throws Exception {
        when(airportService.getAirportsByCity("Delhi")).thenReturn(List.of(sampleAirport(true)));

        mockMvc.perform(get("/airports/city/Delhi"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].city").value("Delhi"));
    }

    @Test
    void getAirportsByCountryReturnsResponse() throws Exception {
        when(airportService.getAirportsByCountry("India")).thenReturn(List.of(sampleAirport(true)));

        mockMvc.perform(get("/airports/country/India"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].country").value("India"));
    }

    @Test
    void updateAirportReturnsUpdatedResponse() throws Exception {
        Airport updated = sampleAirport(false);
        updated.setName("Kempegowda International Airport");
        when(airportService.updateAirport(eq(1L), any(Airport.class))).thenReturn(updated);

        mockMvc.perform(put("/airports/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Kempegowda International Airport"))
                .andExpect(jsonPath("$.isActive").value(false));
    }

    @Test
    void checkAirportActiveReturnsOkWhenActive() throws Exception {
        when(airportService.getAirportById(1L)).thenReturn(sampleAirport(true));

        mockMvc.perform(get("/airports/1/active"))
                .andExpect(status().isOk());
    }

    @Test
    void checkAirportActiveReturnsNotFoundWhenInactive() throws Exception {
        when(airportService.getAirportById(1L)).thenReturn(sampleAirport(false));

        mockMvc.perform(get("/airports/1/active"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteAirportReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/airports/1"))
                .andExpect(status().isNoContent());

        verify(airportService).deleteAirport(1L);
    }

    @Test
    void searchCitiesReturnsEmptyListForBlankTerm() throws Exception {
        mockMvc.perform(get("/airports/search/by-city").param("searchTerm", "   "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void searchCitiesTrimsSearchTerm() throws Exception {
        when(airportService.searchCities("Del")).thenReturn(List.of(sampleAirport(true)));

        mockMvc.perform(get("/airports/search/by-city").param("searchTerm", "  Del  "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].city").value("Delhi"));

        verify(airportService).searchCities("Del");
    }

    @Test
    void createAirportRejectsInvalidPayload() throws Exception {
        AirportRequest invalid = new AirportRequest("", "DE", "", "", null, null, null, null);

        mockMvc.perform(post("/airports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.errors.name").isNotEmpty())
                .andExpect(jsonPath("$.errors.iataCode").value("IATA code must be 3 uppercase letters"));
    }

    private AirportRequest validRequest() {
        return new AirportRequest("Indira Gandhi International Airport", "DEL", "Delhi", "India", "Primary airport", "9876543201", "info@del.airport", true);
    }

    private Airport sampleAirport(Boolean active) {
        Airport airport = new Airport();
        airport.setId(1L);
        airport.setName("Indira Gandhi International Airport");
        airport.setIataCode("DEL");
        airport.setCity("Delhi");
        airport.setCountry("India");
        airport.setDescription("Primary airport");
        airport.setPhoneNumber("9876543201");
        airport.setEmail("info@del.airport");
        airport.setIsActive(active);
        airport.setCreatedAt(LocalDateTime.of(2024, 1, 1, 10, 0));
        airport.setUpdatedAt(LocalDateTime.of(2024, 1, 2, 10, 0));
        return airport;
    }
}
