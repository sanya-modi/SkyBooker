package com.skyBooker.booking.service;

import com.skyBooker.booking.dto.BookingResponse;
import com.skyBooker.booking.dto.FlightBookingAnalyticsResponse;
import com.skyBooker.booking.entity.Booking;
import com.skyBooker.booking.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class BookingServiceImplTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private WebClient.Builder webClientBuilder;
    @Mock private PdfTicketGenerator pdfTicketGenerator;
    @Mock private org.springframework.amqp.rabbit.core.RabbitTemplate rabbitTemplate;

    @InjectMocks
    private BookingServiceImpl bookingService;

    @BeforeEach
    void setup() {
        WebClient webClient = mock(WebClient.class);
        WebClient.RequestHeadersUriSpec getSpec = mock(WebClient.RequestHeadersUriSpec.class);
        WebClient.RequestHeadersSpec headersSpec = mock(WebClient.RequestHeadersSpec.class);
        WebClient.RequestBodyUriSpec postSpec = mock(WebClient.RequestBodyUriSpec.class);
        WebClient.RequestHeadersUriSpec deleteSpec = mock(WebClient.RequestHeadersUriSpec.class);
        WebClient.RequestHeadersSpec deleteHeadersSpec = mock(WebClient.RequestHeadersSpec.class);
        WebClient.ResponseSpec responseSpec = mock(WebClient.ResponseSpec.class);

        doReturn(webClient).when(webClientBuilder).build();

        // ===== GET chain =====
        doReturn(getSpec).when(webClient).get();
        doReturn(headersSpec).when(getSpec).uri(anyString(), any(Object[].class));
        doReturn(responseSpec).when(headersSpec).retrieve();

        // ===== POST chain =====
        doReturn(postSpec).when(webClient).post();
        doReturn(postSpec).when(postSpec).uri(anyString());
        doReturn(postSpec).when(postSpec).bodyValue(any());
        doReturn(responseSpec).when(postSpec).retrieve();

        // ===== DELETE chain =====
        doReturn(deleteSpec).when(webClient).delete();
        doReturn(deleteHeadersSpec).when(deleteSpec).uri(anyString(), any(Object[].class));
        doReturn(responseSpec).when(deleteHeadersSpec).retrieve();

        // ===== Response handling =====
        // Return a FlightDTO for bodyToMono — needed by getFlightDepartureTime / getFlightDetails
        BookingServiceImpl.FlightDTO flightDTO = new BookingServiceImpl.FlightDTO();
        flightDTO.setDepartureTime(LocalDateTime.now().plusDays(7));
        flightDTO.setFlightNumber("SK100");
        flightDTO.setBaseFare(new BigDecimal("5000"));

        doReturn(Mono.just(flightDTO)).when(responseSpec).bodyToMono(any(Class.class));

        // toBodilessEntity — used by bookSeats, releaseSeats, postNotification, etc.
        doReturn(Mono.empty()).when(responseSpec).toBodilessEntity();
    }

    // ================= BASIC =================

    @Test
    void getBookingByIdSuccess() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sample()));

        BookingResponse res = bookingService.getBookingById(1L);

        assertThat(res.getPnr()).isEqualTo("PNR123");
    }

    @Test
    void getBookingByIdThrows() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.getBookingById(1L))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void getBookingByPnrSuccess() {
        when(bookingRepository.findByPnr("PNR123")).thenReturn(Optional.of(sample()));

        assertThat(bookingService.getBookingByPnr("PNR123")).isNotNull();
    }

    @Test
    void getBookingByPnrThrows() {
        when(bookingRepository.findByPnr("X")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.getBookingByPnr("X"))
                .isInstanceOf(RuntimeException.class);
    }

    // ================= STATUS =================

    @Test
    void updateBookingStatusNormal() {
        Booking booking = sample();

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(booking)).thenReturn(booking);

        BookingResponse res =
                bookingService.updateBookingStatus(1L, Booking.BookingStatus.CANCELLED, 99L);

        assertThat(res.getStatus()).isEqualTo("CANCELLED");
    }

    @Test
    void updateBookingStatusConfirmedBranch() {
        Booking booking = sample();

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(booking)).thenReturn(booking);

        bookingService.updateBookingStatus(1L, Booking.BookingStatus.CONFIRMED, null);

        verify(bookingRepository).save(booking);
    }

    // ================= ANALYTICS =================

    @Test
    void analytics() {
        when(bookingRepository.countConfirmedBookingsByFlight(1L)).thenReturn(2L);
        when(bookingRepository.sumConfirmedRevenueByFlight(1L)).thenReturn(new BigDecimal("1000"));

        FlightBookingAnalyticsResponse res = bookingService.getFlightBookingAnalytics(1L);

        assertThat(res.getBookingsCount()).isEqualTo(2L);
    }

    // ================= USER BOOKINGS =================

    @Test
    void getBookingsByUserId() {
        when(bookingRepository.findByUserId(7L)).thenReturn(List.of(sample()));

        assertThat(bookingService.getBookingsByUserId(7L)).hasSize(1);
    }

    // ================= NO SHOW =================

    @Test
    void markNoShows() {
        Booking booking = sample();
        booking.setCheckedIn(false);

        when(bookingRepository.findByStatus(Booking.BookingStatus.CONFIRMED))
                .thenReturn(List.of(booking));

        int result = bookingService.markNoShowsAfterGateClosure();

        assertThat(result).isGreaterThanOrEqualTo(0);
    }

    // ================= HELPER =================

    private Booking sample() {
        Booking b = new Booking();
        b.setId(1L);
        b.setPnr("PNR123");
        b.setUserId(7L);
        b.setFlightId(11L);
        b.setNumberOfPassengers(2);
        b.setBaseFare(new BigDecimal("2000"));
        b.setTaxes(new BigDecimal("300"));
        b.setAncillaryCharges(new BigDecimal("200"));
        b.setTotalFare(new BigDecimal("2500"));
        b.setStatus(Booking.BookingStatus.CONFIRMED);
        b.setBookingDate(LocalDateTime.now());
        b.setSelectedSeats(List.of("1A", "1B"));
        return b;
    }
}