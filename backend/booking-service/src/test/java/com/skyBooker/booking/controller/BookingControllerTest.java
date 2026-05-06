package com.skyBooker.booking.controller;

import com.skyBooker.booking.dto.BookingRequest;
import com.skyBooker.booking.dto.BookingResponse;
import com.skyBooker.booking.dto.FlightBookingAnalyticsResponse;
import com.skyBooker.booking.entity.Booking;
import com.skyBooker.booking.service.BookingService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BookingControllerTest {

    private final BookingService bookingService = mock(BookingService.class);
    private final BookingController controller = new BookingController(bookingService);

    @Test
    void createBookingReturnsCreatedResponse() {
        BookingRequest request = validRequest();
        BookingResponse bookingResponse = sampleResponse();
        when(bookingService.createBooking(request)).thenReturn(bookingResponse);

        ResponseEntity<BookingResponse> response = controller.createBooking(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(bookingResponse);
    }

    @Test
    void getBookingByIdReturnsOk() {
        when(bookingService.getBookingById(1L)).thenReturn(sampleResponse());

        ResponseEntity<BookingResponse> response = controller.getBookingById(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getPnr()).isEqualTo("PNR123");
    }

    @Test
    void getBookingByPnrReturnsOk() {
        when(bookingService.getBookingByPnr("PNR123")).thenReturn(sampleResponse());

        ResponseEntity<BookingResponse> response = controller.getBookingByPnr("PNR123");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getStatus()).isEqualTo("CONFIRMED");
    }

    @Test
    void getBookingsByUserIdReturnsOk() {
        when(bookingService.getBookingsByUserId(7L)).thenReturn(List.of(sampleResponse()));

        ResponseEntity<List<BookingResponse>> response = controller.getBookingsByUserId(7L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void updateBookingStatusReturnsOk() {
        when(bookingService.updateBookingStatus(1L, Booking.BookingStatus.CONFIRMED, 99L)).thenReturn(sampleResponse());

        ResponseEntity<BookingResponse> response = controller.updateBookingStatus(1L, Booking.BookingStatus.CONFIRMED, 99L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getId()).isEqualTo(1L);
    }

    @Test
    void webCheckInReturnsOk() {
        when(bookingService.webCheckIn(1L, "12A")).thenReturn(sampleResponse());

        ResponseEntity<BookingResponse> response = controller.webCheckIn(1L, "12A");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getSelectedSeats()).contains("1A", "1B");
    }

    @Test
    void downloadBoardingPassReturnsPdfAttachment() {
        when(bookingService.generateBoardingPassPdf(1L)).thenReturn(new byte[] {1, 2, 3});

        ResponseEntity<byte[]> response = controller.downloadBoardingPass(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_PDF);
        assertThat(response.getHeaders().getFirst("Content-Disposition")).isEqualTo("attachment; filename=boarding-pass-1.pdf");
        assertThat(response.getBody()).containsExactly(1, 2, 3);
    }

    @Test
    void downloadETicketReturnsPdfAttachment() {
        when(bookingService.generateETicketPdf(1L)).thenReturn(new byte[] {4, 5, 6});

        ResponseEntity<byte[]> response = controller.downloadETicket(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_PDF);
        assertThat(response.getHeaders().getFirst("Content-Disposition")).isEqualTo("attachment; filename=eticket-1.pdf");
        assertThat(response.getBody()).containsExactly(4, 5, 6);
    }

    @Test
    void cancelBookingReturnsNoContent() {
        ResponseEntity<Void> response = controller.cancelBooking(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(bookingService).cancelBooking(1L);
    }

    @Test
    void getConfirmedBookingsByFlightReturnsOk() {
        when(bookingService.getConfirmedBookingsByFlight(11L)).thenReturn(List.of(sampleResponse()));

        ResponseEntity<List<BookingResponse>> response = controller.getConfirmedBookingsByFlight(11L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).singleElement().extracting(BookingResponse::getFlightId).isEqualTo(11L);
    }

    @Test
    void countConfirmedBookingsReturnsOk() {
        when(bookingService.countConfirmedBookings(11L)).thenReturn(3L);

        ResponseEntity<Long> response = controller.countConfirmedBookings(11L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(3L);
    }

    @Test
    void getFlightBookingAnalyticsReturnsOk() {
        FlightBookingAnalyticsResponse analytics = new FlightBookingAnalyticsResponse(11L, 3L, new BigDecimal("4500"));
        when(bookingService.getFlightBookingAnalytics(11L)).thenReturn(analytics);

        ResponseEntity<FlightBookingAnalyticsResponse> response = controller.getFlightBookingAnalytics(11L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(analytics);
    }

    private BookingRequest validRequest() {
        return new BookingRequest(
                7L,
                11L,
                2,
                List.of("1A", "1B"),
                new BigDecimal("300"),
                new BigDecimal("100"),
                new BigDecimal("50"),
                new BigDecimal("25"),
                List.of(
                        new BookingRequest.PassengerValidationRequest(LocalDate.of(1990, 1, 1), BookingRequest.PassengerCategory.ADULT),
                        new BookingRequest.PassengerValidationRequest(LocalDate.of(1992, 1, 1), BookingRequest.PassengerCategory.ADULT)
                ),
                "Window seats"
        );
    }

    private BookingResponse sampleResponse() {
        return new BookingResponse(
                1L,
                "PNR123",
                7L,
                11L,
                2,
                new BigDecimal("2000"),
                new BigDecimal("300"),
                new BigDecimal("200"),
                new BigDecimal("2500"),
                new BigDecimal("2500"),
                "CONFIRMED",
                LocalDateTime.of(2024, 1, 1, 10, 0),
                false,
                null,
                List.of("1A", "1B")
        );
    }
}
