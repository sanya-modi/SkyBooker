package com.skyBooker.booking.controller;

import com.skyBooker.booking.dto.TicketLookupResponse;
import com.skyBooker.booking.service.BookingService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class TicketControllerTest {

    private final BookingService bookingService = mock(BookingService.class);
    private final TicketController controller = new TicketController(bookingService);

    @Test
    void getTicketByPnrReturnsOk() {
        TicketLookupResponse responseBody = new TicketLookupResponse(
                null,
                new TicketLookupResponse.FlightSummary(1L, "SK100", "A320", 5L, 10L, 11L, "2024-01-01T10:00", "2024-01-01T12:00", 180, 20, "ON_TIME"),
                List.of(new TicketLookupResponse.PassengerSummary(1L, 1L, "John", "Doe", "john@test.com", "9876543210", "A1234567", "1990-01-01", "ADULT", "M", "Indian", null))
        );
        when(bookingService.getTicketByPnr("PNR123")).thenReturn(responseBody);

        ResponseEntity<TicketLookupResponse> response = controller.getTicketByPnr("PNR123");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(responseBody);
    }

    @Test
    void getTicketByPnrPropagatesCancelledMessageBranch() {
        when(bookingService.getTicketByPnr("PNR123")).thenThrow(new RuntimeException("This booking has been cancelled"));

        assertThatThrownBy(() -> controller.getTicketByPnr("PNR123"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("This booking has been cancelled");
    }

    @Test
    void getTicketByPnrPropagatesPendingMessageBranch() {
        when(bookingService.getTicketByPnr("PNR123")).thenThrow(new RuntimeException("Payment is pending for this booking. Please complete the payment first."));

        assertThatThrownBy(() -> controller.getTicketByPnr("PNR123"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Payment is pending");
    }

    @Test
    void getTicketByPnrPropagatesOtherRuntimeExceptions() {
        when(bookingService.getTicketByPnr("PNR123")).thenThrow(new RuntimeException("Unexpected lookup failure"));

        assertThatThrownBy(() -> controller.getTicketByPnr("PNR123"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Unexpected lookup failure");
    }
}
