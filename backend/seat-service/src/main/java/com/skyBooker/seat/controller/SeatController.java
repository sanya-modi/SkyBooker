package com.skyBooker.seat.controller;

import com.skyBooker.seat.dto.SeatBookRequest;
import com.skyBooker.seat.dto.SeatClassConfigResponse;
import com.skyBooker.seat.dto.SeatHoldRequest;
import com.skyBooker.seat.dto.SeatInitializationRequest;
import com.skyBooker.seat.dto.SeatConfigRequest;
import com.skyBooker.seat.dto.SeatResponse;
import com.skyBooker.seat.entity.Seat;
import com.skyBooker.seat.entity.SeatClassConfig;
import com.skyBooker.seat.service.SeatService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/seats")
@RequiredArgsConstructor
@Validated
public class SeatController {

    private final SeatService seatService;

    @PostMapping("/initialize")
    public ResponseEntity<Void> initializeSeats(@Valid @RequestBody SeatInitializationRequest request) {
        seatService.initializeSeatsForFlight(request.getFlightId(), request.getTotalSeats());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/flight/{flightId}")
    public ResponseEntity<List<SeatResponse>> getAllSeatsByFlight(@PathVariable @Positive(message = "flightId must be positive") Long flightId) {
        return ResponseEntity.ok(seatService.getAllSeatsByFlight(flightId).stream().map(this::mapToResponse).collect(Collectors.toList()));
    }

    @GetMapping("/flight/{flightId}/stream")
    public SseEmitter streamSeats(@PathVariable @Positive(message = "flightId must be positive") Long flightId) {
        return seatService.subscribeToFlightSeatMap(flightId);
    }

    @GetMapping("/flight/{flightId}/config")
    public ResponseEntity<List<SeatClassConfigResponse>> getSeatConfig(@PathVariable @Positive(message = "flightId must be positive") Long flightId) {
        return ResponseEntity.ok(seatService.getSeatConfig(flightId).stream().map(this::mapConfigToResponse).toList());
    }

    @PostMapping("/flight/{flightId}/config")
    public ResponseEntity<List<SeatClassConfigResponse>> saveSeatConfig(
            @PathVariable @Positive(message = "flightId must be positive") Long flightId,
            @Valid @RequestBody SeatConfigRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(seatService.saveSeatConfig(flightId, request.getRanges()).stream().map(this::mapConfigToResponse).toList());
    }

    @GetMapping("/available/{flightId}")
    public ResponseEntity<List<SeatResponse>> getAvailableSeats(@PathVariable @Positive(message = "flightId must be positive") Long flightId) {
        return ResponseEntity.ok(seatService.getAvailableSeats(flightId).stream().map(this::mapToResponse).collect(Collectors.toList()));
    }

    @GetMapping("/available/{flightId}/{seatClass}")
    public ResponseEntity<List<SeatResponse>> getAvailableSeatsByClass(
            @PathVariable @Positive(message = "flightId must be positive") Long flightId,
            @PathVariable Seat.SeatClass seatClass
    ) {
        return ResponseEntity.ok(seatService.getAvailableSeatsByClass(flightId, seatClass).stream().map(this::mapToResponse).collect(Collectors.toList()));
    }

    @PostMapping("/hold")
    public ResponseEntity<SeatResponse> holdSeat(@Valid @RequestBody SeatHoldRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(
                seatService.holdSeat(request.getFlightId(), request.getSeatNumber(), request.getPassengerId())
        ));
    }

    @PostMapping("/book")
    public ResponseEntity<SeatResponse> bookSeat(@Valid @RequestBody SeatBookRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(
                seatService.bookSeat(request.getFlightId(), request.getSeatNumber(), request.getBookingId(), request.getPassengerId())
        ));
    }

    @DeleteMapping("/{seatId}/release")
    public ResponseEntity<Void> releaseSeat(@PathVariable @Positive(message = "seatId must be positive") Long seatId) {
        seatService.releaseSeat(seatId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/release/{flightId}/{seatNumber}")
    public ResponseEntity<Void> releaseSeatByFlightAndSeatNumber(
            @PathVariable @Positive(message = "flightId must be positive") Long flightId,
            @PathVariable String seatNumber
    ) {
        seatService.releaseSeat(flightId, seatNumber);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{seatId}")
    public ResponseEntity<SeatResponse> getSeatById(@PathVariable @Positive(message = "seatId must be positive") Long seatId) {
        return ResponseEntity.ok(mapToResponse(seatService.getSeatById(seatId)));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<SeatResponse>> getSeatsbyBookingId(@PathVariable @Positive(message = "bookingId must be positive") Long bookingId) {
        return ResponseEntity.ok(seatService.getSeatsbyBookingId(bookingId).stream().map(this::mapToResponse).collect(Collectors.toList()));
    }

    @PostMapping("/release-expired-holds")
    public ResponseEntity<Void> releaseExpiredHolds() {
        seatService.releaseExpiredHolds();
        return ResponseEntity.ok().build();
    }

    private SeatResponse mapToResponse(Seat seat) {
        return new SeatResponse(
                seat.getId(),
                seat.getFlightId(),
                seat.getSeatNumber(),
                seat.getSeatClass(),
                seat.getStatus(),
                seat.getPassengerId(),
                seat.getBookingId(),
                seat.getHoldExpiresAt(),
                seat.getCreatedAt(),
                seat.getUpdatedAt()
        );
    }

    private SeatClassConfigResponse mapConfigToResponse(SeatClassConfig config) {
        return new SeatClassConfigResponse(
                config.getId(),
                config.getFlightId(),
                config.getStartRow(),
                config.getEndRow(),
                config.getSeatClass()
        );
    }
}
