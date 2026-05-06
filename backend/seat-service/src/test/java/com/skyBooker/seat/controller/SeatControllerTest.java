package com.skyBooker.seat.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skyBooker.seat.dto.*;
import com.skyBooker.seat.entity.Seat;
import com.skyBooker.seat.entity.SeatClassConfig;
import com.skyBooker.seat.service.SeatService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SeatController.class)
@DisplayName("Seat Controller Tests")
class SeatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SeatService seatService;

    @Autowired
    private ObjectMapper objectMapper;

    // ================= INITIALIZATION =================

    @Nested
    @DisplayName("Initialize Seats Endpoint")
    class InitializeSeatsTests {

        @Test
        void initializeSeatsSuccess() throws Exception {
            SeatInitializationRequest req = new SeatInitializationRequest(1L, 100);

            mockMvc.perform(post("/seats/initialize")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isCreated());

            verify(seatService).initializeSeatsForFlight(1L, 100);
        }

        @Test
        void initializeSeatsInvalidRequest() throws Exception {
            String invalidRequest = "{}";

            mockMvc.perform(post("/seats/initialize")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(invalidRequest))
                    .andExpect(status().isBadRequest());
        }

        @Test
        void initializeSeatsNullFlightId() throws Exception {
            SeatInitializationRequest req = new SeatInitializationRequest(null, 100);

            mockMvc.perform(post("/seats/initialize")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        void initializeSeatsNullTotalSeats() throws Exception {
            SeatInitializationRequest req = new SeatInitializationRequest(1L, null);

            mockMvc.perform(post("/seats/initialize")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ================= GET SEATS =================

    @Nested
    @DisplayName("Get Seats Endpoints")
    class GetSeatsTests {

        @Test
        void getAllSeatsByFlight() throws Exception {
            Seat seat = createTestSeat(1L, "1A");
            when(seatService.getAllSeatsByFlight(1L)).thenReturn(List.of(seat));

            mockMvc.perform(get("/seats/flight/1")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].flightId").value(1))
                    .andExpect(jsonPath("$[0].seatNumber").value("1A"));
        }

        @Test
        void getAllSeatsByFlightInvalidId() throws Exception {
            mockMvc.perform(get("/seats/flight/-1"))
                    .andExpect(status().isInternalServerError());
        }

        @Test
        void getAllSeatsByFlightEmpty() throws Exception {
            when(seatService.getAllSeatsByFlight(1L)).thenReturn(new ArrayList<>());

            mockMvc.perform(get("/seats/flight/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$.length()").value(0));
        }

        @Test
        void getAvailableSeats() throws Exception {
            Seat seat = createTestSeat(1L, "1A");
            seat.setStatus(Seat.SeatStatus.AVAILABLE);
            when(seatService.getAvailableSeats(1L)).thenReturn(List.of(seat));

            mockMvc.perform(get("/seats/available/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].status").value("AVAILABLE"));
        }

        @Test
        void getAvailableSeatsByClass() throws Exception {
            Seat seat = createTestSeat(1L, "1A");
            seat.setSeatClass(Seat.SeatClass.BUSINESS);
            when(seatService.getAvailableSeatsByClass(1L, Seat.SeatClass.BUSINESS))
                    .thenReturn(List.of(seat));

            mockMvc.perform(get("/seats/available/1/BUSINESS"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].seatClass").value("BUSINESS"));
        }

        @Test
        void getAvailableSeatsByClassInvalidClass() throws Exception {
            mockMvc.perform(get("/seats/available/1/INVALID"))
                    .andExpect(status().isInternalServerError());
        }

        @Test
        void getSeatById() throws Exception {
            Seat seat = createTestSeat(1L, "1A");
            seat.setId(1L);
            when(seatService.getSeatById(1L)).thenReturn(seat);

            mockMvc.perform(get("/seats/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.seatNumber").value("1A"));
        }

        @Test
        void getSeatByIdInvalidId() throws Exception {
            mockMvc.perform(get("/seats/-1"))
                    .andExpect(status().isInternalServerError());
        }

        @Test
        void getSeatsByBookingId() throws Exception {
            Seat seat = createTestSeat(1L, "1A");
            seat.setBookingId(99L);
            when(seatService.getSeatsbyBookingId(99L)).thenReturn(List.of(seat));

            mockMvc.perform(get("/seats/booking/99"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].bookingId").value(99));
        }
    }

    // ================= HOLD SEAT =================

    @Nested
    @DisplayName("Hold Seat Endpoint")
    class HoldSeatTests {

        @Test
        void holdSeatSuccess() throws Exception {
            SeatHoldRequest req = new SeatHoldRequest(1L, "1A", 5L);
            Seat seat = createTestSeat(1L, "1A");
            seat.setStatus(Seat.SeatStatus.HELD);
            seat.setPassengerId(5L);

            when(seatService.holdSeat(1L, "1A", 5L)).thenReturn(seat);

            mockMvc.perform(post("/seats/hold")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.status").value("HELD"))
                    .andExpect(jsonPath("$.passengerId").value(5));
        }

        @Test
        void holdSeatInvalidRequest() throws Exception {
            String invalidRequest = "{}";

            mockMvc.perform(post("/seats/hold")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(invalidRequest))
                    .andExpect(status().isBadRequest());
        }

        @Test
        void holdSeatException() throws Exception {
            SeatHoldRequest req = new SeatHoldRequest(1L, "1A", 5L);

            when(seatService.holdSeat(1L, "1A", 5L))
                    .thenThrow(new RuntimeException("Seat not found"));

            mockMvc.perform(post("/seats/hold")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isInternalServerError());
        }
    }

    // ================= BOOK SEAT =================

    @Nested
    @DisplayName("Book Seat Endpoint")
    class BookSeatTests {

        @Test
        void bookSeatSuccess() throws Exception {
            SeatBookRequest req = new SeatBookRequest(1L, "1A", 10L, 5L);
            Seat seat = createTestSeat(1L, "1A");
            seat.setStatus(Seat.SeatStatus.BOOKED);
            seat.setBookingId(10L);
            seat.setPassengerId(5L);

            when(seatService.bookSeat(1L, "1A", 10L, 5L)).thenReturn(seat);

            mockMvc.perform(post("/seats/book")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.status").value("BOOKED"))
                    .andExpect(jsonPath("$.bookingId").value(10));
        }

        @Test
        void bookSeatInvalidRequest() throws Exception {
            String invalidRequest = "{}";

            mockMvc.perform(post("/seats/book")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(invalidRequest))
                    .andExpect(status().isBadRequest());
        }

        @Test
        void bookSeatNotFound() throws Exception {
            SeatBookRequest req = new SeatBookRequest(1L, "1A", 10L, 5L);

            when(seatService.bookSeat(1L, "1A", 10L, 5L))
                    .thenThrow(new RuntimeException("Seat not found"));

            mockMvc.perform(post("/seats/book")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isInternalServerError());
        }
    }

    // ================= RELEASE SEAT =================

    @Nested
    @DisplayName("Release Seat Endpoints")
    class ReleaseSeatTests {

        @Test
        void releaseSeatById() throws Exception {
            mockMvc.perform(delete("/seats/1/release"))
                    .andExpect(status().isNoContent());

            verify(seatService).releaseSeat(1L);
        }

        @Test
        void releaseSeatByIdInvalidId() throws Exception {
            mockMvc.perform(delete("/seats/-1/release"))
                    .andExpect(status().isInternalServerError());
        }

        @Test
        void releaseSeatByFlightAndSeatNumber() throws Exception {
            mockMvc.perform(delete("/seats/release/1/1A"))
                    .andExpect(status().isNoContent());

            verify(seatService).releaseSeat(1L, "1A");
        }

        @Test
        void releaseSeatByFlightAndSeatNumberInvalidFlight() throws Exception {
            mockMvc.perform(delete("/seats/release/-1/1A"))
                    .andExpect(status().isInternalServerError());
        }
    }

    // ================= SEAT CONFIG =================

    @Nested
    @DisplayName("Seat Configuration Endpoints")
    class SeatConfigTests {

        @Test
        void getSeatConfig() throws Exception {
            SeatClassConfig config = new SeatClassConfig();
            config.setId(1L);
            config.setFlightId(1L);
            config.setStartRow(1);
            config.setEndRow(5);
            config.setSeatClass(Seat.SeatClass.BUSINESS);

            when(seatService.getSeatConfig(1L)).thenReturn(List.of(config));

            mockMvc.perform(get("/seats/flight/1/config"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].startRow").value(1))
                    .andExpect(jsonPath("$[0].endRow").value(5))
                    .andExpect(jsonPath("$[0].seatClass").value("BUSINESS"));
        }

        @Test
        void saveSeatConfig() throws Exception {
            SeatConfigRequest req = new SeatConfigRequest(
                    List.of(new SeatClassRangeRequest(1, 5, Seat.SeatClass.BUSINESS))
            );

            SeatClassConfig config = new SeatClassConfig();
            config.setId(1L);
            config.setFlightId(1L);
            config.setStartRow(1);
            config.setEndRow(5);
            config.setSeatClass(Seat.SeatClass.BUSINESS);

            when(seatService.saveSeatConfig(1L, req.getRanges()))
                    .thenReturn(List.of(config));

            mockMvc.perform(post("/seats/flight/1/config")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$[0].startRow").value(1));
        }

        @Test
        void saveSeatConfigInvalidRequest() throws Exception {
            String invalidRequest = "{\"ranges\": []}";

            mockMvc.perform(post("/seats/flight/1/config")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(invalidRequest))
                    .andExpect(status().isBadRequest());
        }

        @Test
        void getSeatConfigInvalidFlightId() throws Exception {
            mockMvc.perform(get("/seats/flight/-1/config"))
                    .andExpect(status().isInternalServerError());
        }
    }

    // ================= STREAM ENDPOINT =================

    @Nested
    @DisplayName("SSE Stream Endpoint")
    class StreamTests {

        @Test
        void streamSeatsSuccess() throws Exception {
            SseEmitter emitter = new SseEmitter();

            when(seatService.subscribeToFlightSeatMap(1L)).thenReturn(emitter);

            mockMvc.perform(get("/seats/flight/1/stream"))
                    .andExpect(status().isOk());

            verify(seatService).subscribeToFlightSeatMap(1L);
        }

        @Test
        void streamSeatsInvalidFlightId() throws Exception {
            mockMvc.perform(get("/seats/flight/-1/stream"))
                    .andExpect(status().isInternalServerError());
        }
    }

    @Nested
    @DisplayName("Release Expired Holds Endpoint")
    class ReleaseExpiredHoldsTests {

        @Test
        void releaseExpiredHoldsSuccess() throws Exception {
            mockMvc.perform(post("/seats/release-expired-holds"))
                    .andExpect(status().isOk());

            verify(seatService).releaseExpiredHolds();
        }
    }

    // ================= PARAMETERIZED TESTS =================

    @ParameterizedTest
    @ValueSource(longs = {1L, 10L, 100L, 1000L})
    void getAllSeatsByFlightWithVariousIds(Long flightId) throws Exception {
        when(seatService.getAllSeatsByFlight(flightId)).thenReturn(List.of());

        mockMvc.perform(get("/seats/flight/" + flightId))
                .andExpect(status().isOk());
    }

    // ================= HELPER METHODS =================

    private Seat createTestSeat(Long flightId, String seatNumber) {
        Seat seat = new Seat();
        seat.setFlightId(flightId);
        seat.setSeatNumber(seatNumber);
        seat.setStatus(Seat.SeatStatus.AVAILABLE);
        seat.setSeatClass(Seat.SeatClass.ECONOMY);
        seat.setCreatedAt(LocalDateTime.now());
        seat.setUpdatedAt(LocalDateTime.now());
        return seat;
    }
}
