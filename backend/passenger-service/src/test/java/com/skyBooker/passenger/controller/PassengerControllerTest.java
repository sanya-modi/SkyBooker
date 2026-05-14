package com.skyBooker.passenger.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skyBooker.passenger.config.GlobalExceptionHandler;
import com.skyBooker.passenger.dto.PassengerRequest;
import com.skyBooker.passenger.entity.Passenger;
import com.skyBooker.passenger.service.PassengerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class PassengerControllerTest {

    @Mock
    private PassengerService passengerService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new PassengerController(passengerService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper().findAndRegisterModules();
    }

    @Test
    void createPassengerReturnsCreatedResponse() throws Exception {
        Passenger saved = samplePassenger();
        when(passengerService.createPassenger(any(Passenger.class))).thenReturn(saved);

        mockMvc.perform(post("/passengers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.category").value("ADULT"));
    }

    @Test
    void createPassengerWithInvalidBodyReturnsBadRequest() throws Exception {
        PassengerRequest invalid = sampleRequest();
        invalid.setFirstName("");

        mockMvc.perform(post("/passengers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.errors.firstName").exists());
    }

    @Test
    void getPassengerByIdReturnsMappedResponse() throws Exception {
        when(passengerService.getPassengerById(1L)).thenReturn(samplePassenger());

        mockMvc.perform(get("/passengers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.passportNumber").value("P1234567"));
    }

    @Test
    void getPassengersByBookingIdReturnsList() throws Exception {
        when(passengerService.getPassengersByBookingId(10L)).thenReturn(List.of(samplePassenger()));

        mockMvc.perform(get("/passengers/booking/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].bookingId").value(10));
    }

    @Test
    void getPassengerByPassportNumberReturnsResponse() throws Exception {
        when(passengerService.getPassengerByPassportNumber("P1234567")).thenReturn(samplePassenger());

        mockMvc.perform(get("/passengers/passport/P1234567"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nationality").value("Indian"));
    }

    @Test
    void updatePassengerReturnsMappedResponse() throws Exception {
        Passenger updated = samplePassenger();
        updated.setFirstName("Jane");
        when(passengerService.updatePassenger(eq(1L), any(Passenger.class))).thenReturn(updated);

        mockMvc.perform(put("/passengers/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Jane"));
    }

    @Test
    void deletePassengerReturnsNoContent() throws Exception {
        doNothing().when(passengerService).deletePassenger(1L);

        mockMvc.perform(delete("/passengers/1"))
                .andExpect(status().isNoContent());

        verify(passengerService).deletePassenger(1L);
    }

    @Test
    void blockPassengerReturnsOk() throws Exception {
        doNothing().when(passengerService).blockPassenger(1L);

        mockMvc.perform(put("/passengers/1/block"))
                .andExpect(status().isOk());

        verify(passengerService).blockPassenger(1L);
    }

    private PassengerRequest sampleRequest() {
        return new PassengerRequest(
                10L,
                "John",
                "Doe",
                "john@example.com",
                "9876543210",
                "P1234567",
                LocalDate.now().minusYears(25),
                Passenger.Category.ADULT,
                Passenger.Gender.MALE,
                "Indian",
                "Wheelchair",
                null,
                null,
                null,
                null
        );
    }

    private Passenger samplePassenger() {
        Passenger passenger = new Passenger();
        passenger.setId(1L);
        passenger.setBookingId(10L);
        passenger.setFirstName("John");
        passenger.setLastName("Doe");
        passenger.setEmail("john@example.com");
        passenger.setPhoneNumber("9876543210");
        passenger.setPassportNumber("P1234567");
        passenger.setDateOfBirth(LocalDate.now().minusYears(25));
        passenger.setCategory(Passenger.Category.ADULT);
        passenger.setGender(Passenger.Gender.MALE);
        passenger.setNationality("Indian");
        passenger.setSpecialRequests("Wheelchair");
        passenger.setMealPreference(null);
        passenger.setMealPrice(null);
        passenger.setBaggagePreference(null);
        passenger.setBaggagePrice(null);
        passenger.setCreatedAt(LocalDateTime.now().minusDays(1));
        passenger.setUpdatedAt(LocalDateTime.now());
        return passenger;
    }
}
