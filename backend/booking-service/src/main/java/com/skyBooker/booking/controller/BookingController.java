package com.skyBooker.booking.controller;

import com.skyBooker.booking.dto.BookingRequest;
import com.skyBooker.booking.dto.BookingResponse;
import com.skyBooker.booking.dto.FlightBookingAnalyticsResponse;
import com.skyBooker.booking.dto.PlatformBookingsSummaryResponse;
import com.skyBooker.booking.entity.Booking;
import com.skyBooker.booking.service.BookingService;
import com.skyBooker.booking.validation.BookingValidationPatterns;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@Validated
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/pnr/{pnr}")
    public ResponseEntity<BookingResponse> getBookingByPnr(
            @PathVariable
            @Pattern(regexp = BookingValidationPatterns.PNR, message = "PNR must be a 6-character alphanumeric code")
            String pnr
    ) {
        return ResponseEntity.ok(bookingService.getBookingByPnr(pnr));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingResponse>> getBookingsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(bookingService.getBookingsByUserId(userId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam Booking.BookingStatus status,
            @RequestParam(required = false) Long paymentId
    ) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, status, paymentId));
    }

    @PutMapping("/{id}/check-in")
    public ResponseEntity<BookingResponse> webCheckIn(
            @PathVariable Long id,
            @RequestParam(required = false) String seatNumber
    ) {
        return ResponseEntity.ok(bookingService.webCheckIn(id, seatNumber));
    }

    @GetMapping(value = "/{id}/boarding-pass", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> downloadBoardingPass(@PathVariable Long id) {
        byte[] pdf = bookingService.generateBoardingPassPdf(id);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=boarding-pass-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping(value = "/{id}/eticket", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> downloadETicket(@PathVariable Long id) {
        byte[] pdf = bookingService.generateETicketPdf(id);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=eticket-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long id) {
        bookingService.cancelBooking(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/flight/{flightId}/confirmed")
    public ResponseEntity<List<BookingResponse>> getConfirmedBookingsByFlight(@PathVariable Long flightId) {
        return ResponseEntity.ok(bookingService.getConfirmedBookingsByFlight(flightId));
    }

    @GetMapping("/flight/{flightId}/count")
    public ResponseEntity<Long> countConfirmedBookings(@PathVariable Long flightId) {
        return ResponseEntity.ok(bookingService.countConfirmedBookings(flightId));
    }

    @GetMapping("/flight/{flightId}/analytics")
    public ResponseEntity<FlightBookingAnalyticsResponse> getFlightBookingAnalytics(@PathVariable Long flightId) {
        return ResponseEntity.ok(bookingService.getFlightBookingAnalytics(flightId));
    }

    /**
     * Admin-only aggregate endpoint.
     * Returns platform-wide totals in a single DB query — replaces the N-call per-flight analytics fan-out.
     */
    @GetMapping("/admin/analytics/summary")
    public ResponseEntity<PlatformBookingsSummaryResponse> getPlatformSummary() {
        return ResponseEntity.ok(bookingService.getPlatformSummary());
    }
}

