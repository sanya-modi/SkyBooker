package com.skybooker.airlineairport.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skybooker.airlineairport.dto.AirlineRequest;
import com.skybooker.airlineairport.entity.Airline;
import com.skybooker.airlineairport.service.AirlineService;

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

@WebMvcTest(AirlineController.class)
class AirlineControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AirlineService airlineService;

    @Test
    void createAirlineReturnsCreatedResponse() throws Exception {
        when(airlineService.createAirline(any(Airline.class))).thenReturn(sampleAirline(true));

        mockMvc.perform(post("/airlines")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("IndiGo"))
                .andExpect(jsonPath("$.iataCode").value("6E"))
                .andExpect(jsonPath("$.isActive").value(true));
    }

    @Test
    void getAirlineByIdReturnsResponse() throws Exception {
        when(airlineService.getAirlineById(1L)).thenReturn(sampleAirline(true));

        mockMvc.perform(get("/airlines/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.iataCode").value("6E"));
    }

    @Test
    void getAirlineByIataCodeReturnsResponse() throws Exception {
        when(airlineService.getAirlineByIataCode("6E")).thenReturn(sampleAirline(true));

        mockMvc.perform(get("/airlines/iata/6E"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("IndiGo"));
    }

    @Test
    void getAllAirlinesPassesIncludeInactiveFlag() throws Exception {
        when(airlineService.getAllAirlines(true)).thenReturn(List.of(sampleAirline(true)));

        mockMvc.perform(get("/airlines").param("includeInactive", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("IndiGo"));

        verify(airlineService).getAllAirlines(true);
    }

    @Test
    void updateAirlineReturnsUpdatedResponse() throws Exception {
        Airline updated = sampleAirline(false);
        updated.setName("Air India");
        when(airlineService.updateAirline(eq(1L), any(Airline.class))).thenReturn(updated);

        mockMvc.perform(put("/airlines/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Air India"))
                .andExpect(jsonPath("$.isActive").value(false));
    }

    @Test
    void checkAirlineActiveReturnsOkWhenActive() throws Exception {
        when(airlineService.getAirlineById(1L)).thenReturn(sampleAirline(true));

        mockMvc.perform(get("/airlines/1/active"))
                .andExpect(status().isOk());
    }

    @Test
    void checkAirlineActiveReturnsNotFoundWhenInactive() throws Exception {
        when(airlineService.getAirlineById(1L)).thenReturn(sampleAirline(false));

        mockMvc.perform(get("/airlines/1/active"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteAirlineReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/airlines/1"))
                .andExpect(status().isNoContent());

        verify(airlineService).deleteAirline(1L);
    }

    @Test
    void createAirlineRejectsInvalidPayload() throws Exception {
        AirlineRequest invalid = new AirlineRequest("", "x", null, null, null, null);

        mockMvc.perform(post("/airlines")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.errors.name").isNotEmpty())
                .andExpect(jsonPath("$.errors.iataCode").value("IATA code must be 2-3 uppercase letters or digits"));
    }

    private AirlineRequest validRequest() {
        return new AirlineRequest("IndiGo", "6E", "Budget airline", "9876543210", "support@goindigo.in", true);
    }

    private Airline sampleAirline(Boolean active) {
        Airline airline = new Airline();
        airline.setId(1L);
        airline.setName("IndiGo");
        airline.setIataCode("6E");
        airline.setDescription("Budget airline");
        airline.setPhoneNumber("9876543210");
        airline.setEmail("support@goindigo.in");
        airline.setIsActive(active);
        airline.setCreatedAt(LocalDateTime.of(2024, 1, 1, 10, 0));
        airline.setUpdatedAt(LocalDateTime.of(2024, 1, 2, 10, 0));
        return airline;
    }
}
