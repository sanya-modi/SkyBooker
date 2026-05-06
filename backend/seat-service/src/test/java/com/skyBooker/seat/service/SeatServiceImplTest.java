package com.skyBooker.seat.service;

import com.skyBooker.seat.dto.SeatClassRangeRequest;
import com.skyBooker.seat.dto.SeatCountUpdateEvent;
import com.skyBooker.seat.dto.SeatMapUpdateEvent;
import com.skyBooker.seat.dto.FlightAnalyticsEvent;
import com.skyBooker.seat.dto.SeatResponse;
import com.skyBooker.seat.entity.Seat;
import com.skyBooker.seat.entity.SeatClassConfig;
import com.skyBooker.seat.repository.SeatClassConfigRepository;
import com.skyBooker.seat.repository.SeatRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Seat Service Tests")
class SeatServiceImplTest {

    @Mock
    private SeatRepository seatRepository;

    @Mock
    private SeatClassConfigRepository configRepository;

    @InjectMocks
    private SeatServiceImpl service;

    @BeforeEach
    void setup() {
        lenient().when(seatRepository.save(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));
        lenient().when(configRepository.save(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));
        ReflectionTestUtils.setField(service, "restTemplate", mock(RestTemplate.class));
        ReflectionTestUtils.setField(service, "flightServiceUrl", "http://flight-service");
        ReflectionTestUtils.setField(service, "bookingServiceUrl", "http://booking-service");
    }

    // ================= INITIALIZATION =================

    @Nested
    @DisplayName("Initialize Seats")
    class InitializeSeatsTests {
        
        @Test
        void initializeSeatsForFlightSuccess() {
            when(seatRepository.findByFlightId(1L)).thenReturn(new ArrayList<>());
            when(configRepository.findByFlightIdOrderByStartRowAsc(1L)).thenReturn(new ArrayList<>());

            service.initializeSeatsForFlight(1L, 120);

            verify(seatRepository, atLeastOnce()).save(any(Seat.class));
        }

        @Test
        void initializeSeatsWithExistingSeats() {
            Seat existingSeat = availableSeat();
            existingSeat.setSeatNumber("1A");
            
            when(seatRepository.findByFlightId(1L))
                    .thenReturn(List.of(existingSeat));
            when(configRepository.findByFlightIdOrderByStartRowAsc(1L))
                    .thenReturn(new ArrayList<>());

            service.initializeSeatsForFlight(1L, 120);

            verify(seatRepository, atLeast(1)).findByFlightId(1L);
        }

        @Test
        void initializeSeatsRemovesUnavailableSeats() {
            Seat unavailableSeat = availableSeat();
            unavailableSeat.setSeatNumber("50Z");
            unavailableSeat.setStatus(Seat.SeatStatus.AVAILABLE);
            
            when(seatRepository.findByFlightId(1L))
                    .thenReturn(List.of(unavailableSeat));
            when(configRepository.findByFlightIdOrderByStartRowAsc(1L))
                    .thenReturn(new ArrayList<>());

            service.initializeSeatsForFlight(1L, 10);

            verify(seatRepository).delete(unavailableSeat);
        }

        @ParameterizedTest
        @ValueSource(ints = {6, 12, 24, 60, 120, 180})
        void initializeSeatsWithVariousSeatingCapacities(int totalSeats) {
            when(seatRepository.findByFlightId(1L)).thenReturn(new ArrayList<>());
            when(configRepository.findByFlightIdOrderByStartRowAsc(1L))
                    .thenReturn(new ArrayList<>());

            service.initializeSeatsForFlight(1L, totalSeats);

            verify(seatRepository, atLeast(totalSeats - 1)).save(any(Seat.class));
        }
    }

    // ================= HOLD SEAT TESTS =================

    @Nested
    @DisplayName("Hold Seat")
    class HoldSeatTests {
        
        @Test
        void holdSeatSuccess() {
            Seat seat = availableSeat();

            when(seatRepository.findByFlightIdAndSeatNumberForUpdate(1L, "1A"))
                    .thenReturn(Optional.of(seat));

            Seat result = service.holdSeat(1L, "1A", 10L);

            assertThat(result).isNotNull();
            assertThat(result.getStatus()).isEqualTo(Seat.SeatStatus.HELD);
            assertThat(result.getPassengerId()).isEqualTo(10L);
            assertThat(result.getHoldExpiresAt()).isNotNull();
        }

        @Test
        void holdSeatExtendSamePassenger() {
            Seat seat = availableSeat();
            seat.setStatus(Seat.SeatStatus.HELD);
            seat.setPassengerId(10L);
            LocalDateTime previousExpiry = LocalDateTime.now().minusMinutes(5);
            seat.setHoldExpiresAt(previousExpiry);

            when(seatRepository.findByFlightIdAndSeatNumberForUpdate(1L, "1A"))
                    .thenReturn(Optional.of(seat));

            Seat result = service.holdSeat(1L, "1A", 10L);

            assertThat(result).isNotNull();
            assertThat(result.getHoldExpiresAt()).isAfter(previousExpiry);
        }

        @Test
        void holdSeatFailsIfNotAvailable() {
            Seat seat = availableSeat();
            seat.setStatus(Seat.SeatStatus.BOOKED);

            when(seatRepository.findByFlightIdAndSeatNumberForUpdate(1L, "1A"))
                    .thenReturn(Optional.of(seat));

            assertThatThrownBy(() -> service.holdSeat(1L, "1A", 10L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("not available");
        }

        @Test
        void holdSeatFailsIfSeatNotFound() {
            when(seatRepository.findByFlightIdAndSeatNumberForUpdate(1L, "1A"))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.holdSeat(1L, "1A", 10L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("not found");
        }

        @Test
        void holdSeatFailsIfDifferentPassengerAndHeld() {
            Seat seat = availableSeat();
            seat.setStatus(Seat.SeatStatus.HELD);
            seat.setPassengerId(5L);

            when(seatRepository.findByFlightIdAndSeatNumberForUpdate(1L, "1A"))
                    .thenReturn(Optional.of(seat));

            assertThatThrownBy(() -> service.holdSeat(1L, "1A", 10L))
                    .isInstanceOf(RuntimeException.class);
        }
    }

    // ================= BOOK SEAT TESTS =================

    @Nested
    @DisplayName("Book Seat")
    class BookSeatTests {
        
        @Test
        void bookAvailableSeatSuccess() {
            Seat seat = availableSeat();

            when(seatRepository.findByFlightIdAndSeatNumberForUpdate(1L, "1A"))
                    .thenReturn(Optional.of(seat));

            Seat result = service.bookSeat(1L, "1A", 5L, 10L);

            assertThat(result).isNotNull();
            assertThat(result.getStatus()).isEqualTo(Seat.SeatStatus.BOOKED);
            assertThat(result.getBookingId()).isEqualTo(5L);
            assertThat(result.getPassengerId()).isEqualTo(10L);
        }

        @Test
        void bookHeldSeatByCorrectPassenger() {
            Seat seat = availableSeat();
            seat.setStatus(Seat.SeatStatus.HELD);
            seat.setPassengerId(10L);
            seat.setHoldExpiresAt(LocalDateTime.now().plusMinutes(10));

            when(seatRepository.findByFlightIdAndSeatNumberForUpdate(1L, "1A"))
                    .thenReturn(Optional.of(seat));

            Seat result = service.bookSeat(1L, "1A", 5L, 10L);

            assertThat(result.getStatus()).isEqualTo(Seat.SeatStatus.BOOKED);
            assertThat(result.getHoldExpiresAt()).isNull();
        }

        @Test
        void bookSeatAlreadyBooked() {
            Seat seat = availableSeat();
            seat.setStatus(Seat.SeatStatus.BOOKED);

            when(seatRepository.findByFlightIdAndSeatNumberForUpdate(1L, "1A"))
                    .thenReturn(Optional.of(seat));

            assertThatThrownBy(() -> service.bookSeat(1L, "1A", 5L, 10L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("already booked");
        }

        @Test
        void bookSeatHeldByDifferentPassenger() {
            Seat seat = availableSeat();
            seat.setStatus(Seat.SeatStatus.HELD);
            seat.setPassengerId(5L);

            when(seatRepository.findByFlightIdAndSeatNumberForUpdate(1L, "1A"))
                    .thenReturn(Optional.of(seat));

            assertThatThrownBy(() -> service.bookSeat(1L, "1A", 10L, 10L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("held by another");
        }

        @Test
        void bookSeatNotFound() {
            when(seatRepository.findByFlightIdAndSeatNumberForUpdate(1L, "1A"))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.bookSeat(1L, "1A", 5L, 10L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("not found");
        }

        @Test
        void bookSeatUnavailableStatusFails() {
            Seat seat = availableSeat();
            seat.setStatus(Seat.SeatStatus.UNAVAILABLE);

            when(seatRepository.findByFlightIdAndSeatNumberForUpdate(1L, "1A"))
                    .thenReturn(Optional.of(seat));

            assertThatThrownBy(() -> service.bookSeat(1L, "1A", 5L, 10L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("not available for booking");
        }
    }

    // ================= RELEASE SEAT TESTS =================

    @Nested
    @DisplayName("Release Seat")
    class ReleaseSeatTests {
        
        @Test
        void releaseSeatByIdSuccess() {
            Seat seat = availableSeat();
            seat.setId(1L);
            seat.setStatus(Seat.SeatStatus.BOOKED);
            seat.setBookingId(5L);

            when(seatRepository.findById(1L)).thenReturn(Optional.of(seat));

            service.releaseSeat(1L);

            assertThat(seat.getStatus()).isEqualTo(Seat.SeatStatus.AVAILABLE);
            assertThat(seat.getBookingId()).isNull();
            assertThat(seat.getPassengerId()).isNull();
        }

        @Test
        void releaseSeatByIdNotFound() {
            when(seatRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.releaseSeat(1L))
                    .isInstanceOf(RuntimeException.class);
        }

        @Test
        void releaseSeatByFlightAndSeatNumber() {
            Seat seat = availableSeat();
            seat.setStatus(Seat.SeatStatus.HELD);
            seat.setPassengerId(10L);

            when(seatRepository.findByFlightIdAndSeatNumber(1L, "1A"))
                    .thenReturn(Optional.of(seat));

            service.releaseSeat(1L, "1A");

            assertThat(seat.getStatus()).isEqualTo(Seat.SeatStatus.AVAILABLE);
            verify(seatRepository).save(seat);
        }

        @Test
        void releaseSeatByFlightAndSeatNumberNotFound() {
            when(seatRepository.findByFlightIdAndSeatNumber(1L, "1A"))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.releaseSeat(1L, "1A"))
                    .isInstanceOf(RuntimeException.class);
        }
    }

    // ================= GET SEAT TESTS =================

    @Nested
    @DisplayName("Get Seat")
    class GetSeatTests {
        
        @Test
        void getSeatByIdSuccess() {
            Seat seat = availableSeat();
            seat.setId(1L);

            when(seatRepository.findById(1L)).thenReturn(Optional.of(seat));

            Seat result = service.getSeatById(1L);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1L);
        }

        @Test
        void getSeatByIdNotFound() {
            when(seatRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.getSeatById(1L))
                    .isInstanceOf(RuntimeException.class);
        }

        @Test
        void getAllSeatsByFlight() {
            List<Seat> seats = List.of(availableSeat(), availableSeat());

            when(seatRepository.findByFlightId(1L)).thenReturn(seats);

            List<Seat> result = service.getAllSeatsByFlight(1L);

            assertThat(result).hasSize(2);
        }

        @Test
        void getAvailableSeats() {
            Seat available = availableSeat();
            Seat booked = availableSeat();
            booked.setStatus(Seat.SeatStatus.BOOKED);

            when(seatRepository.findAvailableSeats(1L)).thenReturn(List.of(available));

            List<Seat> result = service.getAvailableSeats(1L);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getStatus()).isEqualTo(Seat.SeatStatus.AVAILABLE);
        }

        @Test
        void getAvailableSeatsByClass() {
            Seat economySeat = availableSeat();
            economySeat.setSeatClass(Seat.SeatClass.ECONOMY);

            when(seatRepository.findAvailableSeatsByClass(1L, Seat.SeatClass.ECONOMY))
                    .thenReturn(List.of(economySeat));

            List<Seat> result = service.getAvailableSeatsByClass(1L, Seat.SeatClass.ECONOMY);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getSeatClass()).isEqualTo(Seat.SeatClass.ECONOMY);
        }

        @Test
        void getSeatsbyBookingId() {
            Seat seat = availableSeat();
            seat.setBookingId(100L);

            when(seatRepository.findByBookingId(100L)).thenReturn(List.of(seat));

            List<Seat> result = service.getSeatsbyBookingId(100L);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getBookingId()).isEqualTo(100L);
        }
    }

    // ================= SEAT CONFIG TESTS =================

    @Nested
    @DisplayName("Seat Configuration")
    class SeatConfigTests {
        
        @Test
        void saveSeatConfigValid() {
            SeatClassRangeRequest range1 =
                    new SeatClassRangeRequest(1, 5, Seat.SeatClass.BUSINESS);
            SeatClassRangeRequest range2 =
                    new SeatClassRangeRequest(6, 10, Seat.SeatClass.ECONOMY);

            when(seatRepository.findByFlightId(1L)).thenReturn(List.of());

            List<SeatClassConfig> result =
                    service.saveSeatConfig(1L, List.of(range1, range2));

            assertThat(result).hasSize(2);
            verify(configRepository, times(2)).save(any(SeatClassConfig.class));
        }

        @Test
        void saveSeatConfigOverlapsFails() {
            SeatClassRangeRequest range1 =
                    new SeatClassRangeRequest(1, 5, Seat.SeatClass.BUSINESS);
            SeatClassRangeRequest range2 =
                    new SeatClassRangeRequest(4, 10, Seat.SeatClass.ECONOMY);

            assertThatThrownBy(() -> service.saveSeatConfig(1L, List.of(range1, range2)))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("overlap");
        }

        @Test
        void saveSeatConfigInvalidRangeFails() {
            SeatClassRangeRequest range =
                    new SeatClassRangeRequest(10, 5, Seat.SeatClass.BUSINESS);

            assertThatThrownBy(() -> service.saveSeatConfig(1L, List.of(range)))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("greater than");
        }

        @Test
        void getSeatConfig() {
            SeatClassConfig config = new SeatClassConfig();
            config.setFlightId(1L);
            config.setStartRow(1);
            config.setEndRow(5);

            when(configRepository.findByFlightIdOrderByStartRowAsc(1L))
                    .thenReturn(List.of(config));

            List<SeatClassConfig> result = service.getSeatConfig(1L);

            assertThat(result).hasSize(1);
        }
    }

    // ================= EXPIRED HOLDS TESTS =================

    @Nested
    @DisplayName("Release Expired Holds")
    class ExpiredHoldsTests {
        
        @Test
        void releaseExpiredHolds() {
            Seat expiredSeat = availableSeat();
            expiredSeat.setStatus(Seat.SeatStatus.HELD);
            expiredSeat.setPassengerId(10L);
            expiredSeat.setHoldExpiresAt(LocalDateTime.now().minusMinutes(1));

            when(seatRepository.findExpiredHeldSeats(any(LocalDateTime.class)))
                    .thenReturn(List.of(expiredSeat));

            service.releaseExpiredHolds();

            assertThat(expiredSeat.getStatus()).isEqualTo(Seat.SeatStatus.AVAILABLE);
            assertThat(expiredSeat.getPassengerId()).isNull();
        }

        @Test
        void releaseExpiredHoldsEmpty() {
            when(seatRepository.findExpiredHeldSeats(any(LocalDateTime.class)))
                    .thenReturn(List.of());

            service.releaseExpiredHolds();

            verify(seatRepository, never()).save(any());
        }

        @Test
        void scheduledReleaseExpiredHoldsDelegates() {
            when(seatRepository.findExpiredHeldSeats(any(LocalDateTime.class)))
                    .thenReturn(List.of());

            service.scheduledReleaseExpiredHolds();

            verify(seatRepository).findExpiredHeldSeats(any(LocalDateTime.class));
        }
    }

    // ================= SSE SUBSCRIPTION TESTS =================

    @Nested
    @DisplayName("SSE Subscriptions")
    class SseSubscriptionTests {
        
        @Test
        void subscribeToFlightSeatMap() {
            List<Seat> seats = List.of(availableSeat());

            when(seatRepository.findByFlightId(1L)).thenReturn(seats);
            when(configRepository.findByFlightIdOrderByStartRowAsc(1L))
                    .thenReturn(List.of());

            SseEmitter emitter = service.subscribeToFlightSeatMap(1L);

            assertThat(emitter).isNotNull();
        }

        @Test
        void subscribeToFlightSeatMapWithSeats() {
            Seat seat1 = availableSeat();
            Seat seat2 = availableSeat();
            seat2.setSeatNumber("1B");
            seat2.setStatus(Seat.SeatStatus.BOOKED);

            List<Seat> seats = List.of(seat1, seat2);

            when(seatRepository.findByFlightId(1L)).thenReturn(seats);
            when(configRepository.findByFlightIdOrderByStartRowAsc(1L))
                    .thenReturn(List.of());

            SseEmitter emitter = service.subscribeToFlightSeatMap(1L);

            assertThat(emitter).isNotNull();
        }

        @Test
        void publishSeatUpdateWithEmitterAndAnalytics() {
            RestTemplate restTemplate = mock(RestTemplate.class);
            ReflectionTestUtils.setField(service, "restTemplate", restTemplate);

            Seat bookedSeat = availableSeat();
            bookedSeat.setStatus(Seat.SeatStatus.BOOKED);
            bookedSeat.setBookingId(77L);
            Seat availableSeat = availableSeat();
            availableSeat.setSeatNumber("1B");

            SeatClassConfig config = new SeatClassConfig();
            config.setId(1L);
            config.setFlightId(1L);
            config.setStartRow(1);
            config.setEndRow(2);
            config.setSeatClass(Seat.SeatClass.BUSINESS);

            when(seatRepository.findByFlightId(1L)).thenReturn(List.of(bookedSeat, availableSeat));
            when(configRepository.findByFlightIdOrderByStartRowAsc(1L)).thenReturn(List.of(config));

            SseEmitter emitter = service.subscribeToFlightSeatMap(1L);
            service.publishSeatUpdate(1L, "BOOKED");

            verify(restTemplate, atLeastOnce()).put("http://flight-service/flights/1/available-seats?count=1", null);
        }
    }

    // ================= HELPER METHODS =================

    @Test
    void supportClassesAndHelpersAreCovered() throws Exception {
        Class<?> analyticsClass = Class.forName("com.skyBooker.seat.service.SeatServiceImpl$BookingAnalyticsDTO");
        Constructor<?> constructor = analyticsClass.getDeclaredConstructor();
        constructor.setAccessible(true);
        Object analytics = constructor.newInstance();

        Method setBookingsCount = analyticsClass.getDeclaredMethod("setBookingsCount", Long.class);
        Method setRevenue = analyticsClass.getDeclaredMethod("setRevenue", BigDecimal.class);
        Method getBookingsCount = analyticsClass.getDeclaredMethod("getBookingsCount");
        Method getRevenue = analyticsClass.getDeclaredMethod("getRevenue");
        setBookingsCount.setAccessible(true);
        setRevenue.setAccessible(true);
        getBookingsCount.setAccessible(true);
        getRevenue.setAccessible(true);

        setBookingsCount.invoke(analytics, 5L);
        setRevenue.invoke(analytics, new BigDecimal("1500"));

        assertThat(getBookingsCount.invoke(analytics)).isEqualTo(5L);
        assertThat(getRevenue.invoke(analytics)).isEqualTo(new BigDecimal("1500"));
    }

    @Test
    void privateServiceHelpersCoverRemainingBranches() throws Exception {
        RestTemplate restTemplate = mock(RestTemplate.class);
        ReflectionTestUtils.setField(service, "restTemplate", restTemplate);

        Class<?> analyticsClass = Class.forName("com.skyBooker.seat.service.SeatServiceImpl$BookingAnalyticsDTO");
        Constructor<?> constructor = analyticsClass.getDeclaredConstructor();
        constructor.setAccessible(true);
        Object analytics = constructor.newInstance();
        Method setBookingsCount = analyticsClass.getDeclaredMethod("setBookingsCount", Long.class);
        Method setRevenue = analyticsClass.getDeclaredMethod("setRevenue", BigDecimal.class);
        setBookingsCount.setAccessible(true);
        setRevenue.setAccessible(true);
        setBookingsCount.invoke(analytics, 4L);
        setRevenue.invoke(analytics, new BigDecimal("4200"));

        doReturn(analytics).when(restTemplate).getForObject(eq("http://booking-service/bookings/flight/1/analytics"), any(Class.class));

        Method buildAnalyticsEvent = SeatServiceImpl.class.getDeclaredMethod("buildAnalyticsEvent", Long.class, List.class);
        buildAnalyticsEvent.setAccessible(true);

        Seat bookedSeat = availableSeat();
        bookedSeat.setStatus(Seat.SeatStatus.BOOKED);
        bookedSeat.setBookingId(88L);
        Seat secondSeat = availableSeat();
        secondSeat.setSeatNumber("2A");
        secondSeat.setBookingId(89L);

        FlightAnalyticsEvent event = (FlightAnalyticsEvent) buildAnalyticsEvent.invoke(service, 1L, List.of(bookedSeat, secondSeat));
        assertThat(event.getRevenue()).isEqualByComparingTo("4200");
        assertThat(event.getBookingsCount()).isEqualTo(4);

        Method applySeatConfigToSeats = SeatServiceImpl.class.getDeclaredMethod("applySeatConfigToSeats", Long.class);
        applySeatConfigToSeats.setAccessible(true);

        Seat seatToUpdate = availableSeat();
        seatToUpdate.setSeatClass(Seat.SeatClass.ECONOMY);
        Seat seatUnchanged = availableSeat();
        seatUnchanged.setSeatNumber("10A");
        seatUnchanged.setSeatClass(Seat.SeatClass.ECONOMY);

        SeatClassConfig config = new SeatClassConfig();
        config.setFlightId(1L);
        config.setStartRow(1);
        config.setEndRow(2);
        config.setSeatClass(Seat.SeatClass.BUSINESS);

        when(configRepository.findByFlightIdOrderByStartRowAsc(1L)).thenReturn(List.of(config));
        when(seatRepository.findByFlightId(1L)).thenReturn(List.of(seatToUpdate, seatUnchanged));

        applySeatConfigToSeats.invoke(service, 1L);

        assertThat(seatToUpdate.getSeatClass()).isEqualTo(Seat.SeatClass.BUSINESS);
        assertThat(seatUnchanged.getSeatClass()).isEqualTo(Seat.SeatClass.ECONOMY);

        Method removeEmitter = SeatServiceImpl.class.getDeclaredMethod("removeEmitter", Long.class, SseEmitter.class);
        removeEmitter.setAccessible(true);
        SseEmitter emitter = new SseEmitter();
        ReflectionTestUtils.setField(service, "emittersByFlight", new java.util.concurrent.ConcurrentHashMap<>(java.util.Map.of(1L, new ArrayList<>(List.of(emitter)))));
        removeEmitter.invoke(service, 1L, emitter);
        @SuppressWarnings("unchecked")
        java.util.Map<Long, List<SseEmitter>> emittersByFlight = (java.util.Map<Long, List<SseEmitter>>) ReflectionTestUtils.getField(service, "emittersByFlight");
        assertThat(emittersByFlight.get(1L)).isEmpty();

        Method sendEvent = SeatServiceImpl.class.getDeclaredMethod("sendEvent", SseEmitter.class, SeatMapUpdateEvent.class);
        Method sendCountEvent = SeatServiceImpl.class.getDeclaredMethod("sendCountEvent", SseEmitter.class, SeatCountUpdateEvent.class);
        Method sendAnalyticsEvent = SeatServiceImpl.class.getDeclaredMethod("sendAnalyticsEvent", SseEmitter.class, FlightAnalyticsEvent.class);
        sendEvent.setAccessible(true);
        sendCountEvent.setAccessible(true);
        sendAnalyticsEvent.setAccessible(true);

        SseEmitter completedEmitter = new SseEmitter();
        completedEmitter.complete();
        sendEvent.invoke(service, completedEmitter, new SeatMapUpdateEvent(1L, "SNAPSHOT", LocalDateTime.now(), List.of(), List.of()));
        sendCountEvent.invoke(service, completedEmitter, new SeatCountUpdateEvent(1L, 10, 2, 8));
        sendAnalyticsEvent.invoke(service, completedEmitter, new FlightAnalyticsEvent(1L, 10, 2, 8, BigDecimal.TEN, 2));
    }

    private Seat availableSeat() {
        Seat seat = new Seat();
        seat.setFlightId(1L);
        seat.setSeatNumber("1A");
        seat.setStatus(Seat.SeatStatus.AVAILABLE);
        seat.setSeatClass(Seat.SeatClass.ECONOMY);
        return seat;
    }
}
