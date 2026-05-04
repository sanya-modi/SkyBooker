package com.skyBooker.booking.controller;

import com.skyBooker.booking.dto.TicketLookupResponse;
import com.skyBooker.booking.service.BookingService;
import com.skyBooker.booking.validation.BookingValidationPatterns;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
@Validated
public class TicketController {

    private final BookingService bookingService;

    @GetMapping("/pnr/{pnr}")
    public ResponseEntity<TicketLookupResponse> getTicketByPnr(
            @PathVariable
            @Pattern(regexp = BookingValidationPatterns.PNR, message = "PNR must be a 6-character alphanumeric code")
            String pnr
    ) {
        try {
            return ResponseEntity.ok(bookingService.getTicketByPnr(pnr));
        } catch (RuntimeException e) {
            // Propagate specific error messages for cancelled and pending bookings
            if (e.getMessage().equals("This booking has been cancelled") ||
                e.getMessage().contains("Payment is pending")) {
                throw e;
            }
            throw e;
        }
    }
}
