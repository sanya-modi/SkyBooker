package com.skyBooker.seat.dto;

import com.skyBooker.seat.entity.Seat;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Seat DTOs Tests")
class SeatDTOsTest {

    // ================= SEAT INITIALIZATION REQUEST =================

    @Nested
    @DisplayName("SeatInitializationRequest DTO")
    class SeatInitializationRequestTests {

        @Test
        void createSeatInitializationRequest() {
            SeatInitializationRequest request = new SeatInitializationRequest(1L, 100);

            assertThat(request.getFlightId()).isEqualTo(1L);
            assertThat(request.getTotalSeats()).isEqualTo(100);
        }

        @Test
        void seatInitializationRequestWithNullFlightId() {
            SeatInitializationRequest request = new SeatInitializationRequest(null, 100);

            assertThat(request.getFlightId()).isNull();
        }

        @Test
        void seatInitializationRequestWithNullSeats() {
            SeatInitializationRequest request = new SeatInitializationRequest(1L, null);

            assertThat(request.getTotalSeats()).isNull();
        }
    }

    // ================= SEAT HOLD REQUEST =================

    @Nested
    @DisplayName("SeatHoldRequest DTO")
    class SeatHoldRequestTests {

        @Test
        void createSeatHoldRequest() {
            SeatHoldRequest request = new SeatHoldRequest(1L, "1A", 10L);

            assertThat(request.getFlightId()).isEqualTo(1L);
            assertThat(request.getSeatNumber()).isEqualTo("1A");
            assertThat(request.getPassengerId()).isEqualTo(10L);
        }

        @Test
        void seatHoldRequestWithDifferentValues() {
            SeatHoldRequest request = new SeatHoldRequest(5L, "5F", 20L);

            assertThat(request.getFlightId()).isEqualTo(5L);
            assertThat(request.getSeatNumber()).isEqualTo("5F");
            assertThat(request.getPassengerId()).isEqualTo(20L);
        }
    }

    // ================= SEAT BOOK REQUEST =================

    @Nested
    @DisplayName("SeatBookRequest DTO")
    class SeatBookRequestTests {

        @Test
        void createSeatBookRequest() {
            SeatBookRequest request = new SeatBookRequest(1L, "1A", 100L, 10L);

            assertThat(request.getFlightId()).isEqualTo(1L);
            assertThat(request.getSeatNumber()).isEqualTo("1A");
            assertThat(request.getBookingId()).isEqualTo(100L);
            assertThat(request.getPassengerId()).isEqualTo(10L);
        }

        @Test
        void seatBookRequestAllFields() {
            SeatBookRequest request = new SeatBookRequest(2L, "2B", 200L, 20L);

            assertThat(request)
                    .hasFieldOrPropertyWithValue("flightId", 2L)
                    .hasFieldOrPropertyWithValue("seatNumber", "2B")
                    .hasFieldOrPropertyWithValue("bookingId", 200L)
                    .hasFieldOrPropertyWithValue("passengerId", 20L);
        }
    }

    // ================= SEAT CLASS RANGE REQUEST =================

    @Nested
    @DisplayName("SeatClassRangeRequest DTO")
    class SeatClassRangeRequestTests {

        @Test
        void createSeatClassRangeRequest() {
            SeatClassRangeRequest request = new SeatClassRangeRequest(1, 5, Seat.SeatClass.BUSINESS);

            assertThat(request.getStartRow()).isEqualTo(1);
            assertThat(request.getEndRow()).isEqualTo(5);
            assertThat(request.getSeatClass()).isEqualTo(Seat.SeatClass.BUSINESS);
        }

        @Test
        void seatClassRangeRequestEconomy() {
            SeatClassRangeRequest request = new SeatClassRangeRequest(10, 20, Seat.SeatClass.ECONOMY);

            assertThat(request.getStartRow()).isEqualTo(10);
            assertThat(request.getEndRow()).isEqualTo(20);
            assertThat(request.getSeatClass()).isEqualTo(Seat.SeatClass.ECONOMY);
        }

        @Test
        void seatClassRangeRequestFirst() {
            SeatClassRangeRequest request = new SeatClassRangeRequest(1, 3, Seat.SeatClass.FIRST);

            assertThat(request.getSeatClass()).isEqualTo(Seat.SeatClass.FIRST);
        }
    }

    // ================= SEAT CONFIG REQUEST =================

    @Nested
    @DisplayName("SeatConfigRequest DTO")
    class SeatConfigRequestTests {

        @Test
        void createSeatConfigRequest() {
            SeatClassRangeRequest range1 = new SeatClassRangeRequest(1, 5, Seat.SeatClass.BUSINESS);
            SeatClassRangeRequest range2 = new SeatClassRangeRequest(6, 10, Seat.SeatClass.ECONOMY);

            SeatConfigRequest request = new SeatConfigRequest(java.util.List.of(range1, range2));

            assertThat(request.getRanges()).hasSize(2);
            assertThat(request.getRanges().get(0).getStartRow()).isEqualTo(1);
        }

        @Test
        void seatConfigRequestEmpty() {
            SeatConfigRequest request = new SeatConfigRequest(java.util.List.of());

            assertThat(request.getRanges()).isEmpty();
        }
    }

    // ================= SEAT RESPONSE =================

    @Nested
    @DisplayName("SeatResponse DTO")
    class SeatResponseTests {

        @Test
        void createSeatResponse() {
            LocalDateTime now = LocalDateTime.now();
            SeatResponse response = new SeatResponse(
                    1L, 1L, "1A", Seat.SeatClass.ECONOMY,
                    Seat.SeatStatus.AVAILABLE, null, null, null, now, now
            );

            assertThat(response.getId()).isEqualTo(1L);
            assertThat(response.getFlightId()).isEqualTo(1L);
            assertThat(response.getSeatNumber()).isEqualTo("1A");
            assertThat(response.getSeatClass()).isEqualTo(Seat.SeatClass.ECONOMY);
            assertThat(response.getStatus()).isEqualTo(Seat.SeatStatus.AVAILABLE);
        }

        @Test
        void seatResponseWithBooking() {
            LocalDateTime now = LocalDateTime.now();
            SeatResponse response = new SeatResponse(
                    2L, 2L, "2B", Seat.SeatClass.BUSINESS,
                    Seat.SeatStatus.BOOKED, 100L, 200L, null, now, now
            );

            assertThat(response.getPassengerId()).isEqualTo(100L);
            assertThat(response.getBookingId()).isEqualTo(200L);
            assertThat(response.getStatus()).isEqualTo(Seat.SeatStatus.BOOKED);
        }

        @Test
        void seatResponseWithHold() {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime expiry = now.plusMinutes(15);
            SeatResponse response = new SeatResponse(
                    3L, 3L, "3C", Seat.SeatClass.FIRST,
                    Seat.SeatStatus.HELD, 50L, null, expiry, now, now
            );

            assertThat(response.getStatus()).isEqualTo(Seat.SeatStatus.HELD);
            assertThat(response.getPassengerId()).isEqualTo(50L);
            assertThat(response.getHoldExpiresAt()).isEqualTo(expiry);
        }
    }

    // ================= SEAT CLASS CONFIG RESPONSE =================

    @Nested
    @DisplayName("SeatClassConfigResponse DTO")
    class SeatClassConfigResponseTests {

        @Test
        void createSeatClassConfigResponse() {
            SeatClassConfigResponse response = new SeatClassConfigResponse(
                    1L, 1L, 1, 5, Seat.SeatClass.BUSINESS
            );

            assertThat(response.getId()).isEqualTo(1L);
            assertThat(response.getFlightId()).isEqualTo(1L);
            assertThat(response.getStartRow()).isEqualTo(1);
            assertThat(response.getEndRow()).isEqualTo(5);
            assertThat(response.getSeatClass()).isEqualTo(Seat.SeatClass.BUSINESS);
        }

        @Test
        void seatClassConfigResponseMultipleRanges() {
            SeatClassConfigResponse[] responses = {
                    new SeatClassConfigResponse(1L, 1L, 1, 5, Seat.SeatClass.FIRST),
                    new SeatClassConfigResponse(2L, 1L, 6, 15, Seat.SeatClass.BUSINESS),
                    new SeatClassConfigResponse(3L, 1L, 16, 100, Seat.SeatClass.ECONOMY)
            };

            assertThat(responses).hasSize(3);
            assertThat(responses[0].getSeatClass()).isEqualTo(Seat.SeatClass.FIRST);
            assertThat(responses[1].getSeatClass()).isEqualTo(Seat.SeatClass.BUSINESS);
            assertThat(responses[2].getSeatClass()).isEqualTo(Seat.SeatClass.ECONOMY);
        }
    }

    // ================= SEAT MAP UPDATE EVENT =================

    @Nested
    @DisplayName("SeatMapUpdateEvent DTO")
    class SeatMapUpdateEventTests {

        @Test
        void createSeatMapUpdateEvent() {
            LocalDateTime now = LocalDateTime.now();
            java.util.List<SeatResponse> seats = java.util.List.of();
            java.util.List<SeatClassConfigResponse> configs = java.util.List.of();

            SeatMapUpdateEvent event = new SeatMapUpdateEvent(
                    1L, "INITIALIZED", now, seats, configs
            );

            assertThat(event.getFlightId()).isEqualTo(1L);
            assertThat(event.getEventType()).isEqualTo("INITIALIZED");
            assertThat(event.getTimestamp()).isEqualTo(now);
            assertThat(event.getSeats()).isEmpty();
            assertThat(event.getConfigs()).isEmpty();
        }

        @Test
        void seatMapUpdateEventWithData() {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime seatTime = LocalDateTime.now();
            SeatResponse seat = new SeatResponse(
                    1L, 1L, "1A", Seat.SeatClass.ECONOMY,
                    Seat.SeatStatus.AVAILABLE, null, null, null, seatTime, seatTime
            );
            SeatClassConfigResponse config = new SeatClassConfigResponse(
                    1L, 1L, 1, 5, Seat.SeatClass.ECONOMY
            );

            SeatMapUpdateEvent event = new SeatMapUpdateEvent(
                    1L, "INITIALIZED", now,
                    java.util.List.of(seat),
                    java.util.List.of(config)
            );

            assertThat(event.getSeats()).hasSize(1);
            assertThat(event.getConfigs()).hasSize(1);
        }
    }

    // ================= SEAT COUNT UPDATE EVENT =================

    @Nested
    @DisplayName("SeatCountUpdateEvent DTO")
    class SeatCountUpdateEventTests {

        @Test
        void createSeatCountUpdateEvent() {
            SeatCountUpdateEvent event = new SeatCountUpdateEvent(
                    1L, 100, 50, 50
            );

            assertThat(event.getFlightId()).isEqualTo(1L);
            assertThat(event.getTotalSeats()).isEqualTo(100);
            assertThat(event.getBookedSeats()).isEqualTo(50);
            assertThat(event.getAvailableSeats()).isEqualTo(50);
        }

        @Test
        void seatCountUpdateEventWithDifferentCounts() {
            SeatCountUpdateEvent event = new SeatCountUpdateEvent(
                    2L, 200, 150, 50
            );

            assertThat(event.getTotalSeats()).isEqualTo(200);
            assertThat(event.getBookedSeats()).isEqualTo(150);
            assertThat(event.getAvailableSeats()).isEqualTo(50);
        }
    }

    // ================= FLIGHT ANALYTICS EVENT =================

    @Nested
    @DisplayName("FlightAnalyticsEvent DTO")
    class FlightAnalyticsEventTests {

        @Test
        void createFlightAnalyticsEvent() {
            FlightAnalyticsEvent event = new FlightAnalyticsEvent(
                    1L, 100, 50, 50, java.math.BigDecimal.valueOf(10000), 50
            );

            assertThat(event.getFlightId()).isEqualTo(1L);
            assertThat(event.getTotalSeats()).isEqualTo(100);
            assertThat(event.getBookedSeats()).isEqualTo(50);
            assertThat(event.getAvailableSeats()).isEqualTo(50);
            assertThat(event.getRevenue()).isEqualTo(java.math.BigDecimal.valueOf(10000));
            assertThat(event.getBookingsCount()).isEqualTo(50);
        }

        @Test
        void flightAnalyticsEventZeroRevenue() {
            FlightAnalyticsEvent event = new FlightAnalyticsEvent(
                    1L, 100, 0, 100, java.math.BigDecimal.ZERO, 0
            );

            assertThat(event.getRevenue()).isEqualTo(java.math.BigDecimal.ZERO);
            assertThat(event.getBookingsCount()).isEqualTo(0);
        }
    }
}