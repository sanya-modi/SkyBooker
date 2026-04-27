package com.skyBooker.passenger.controller;

import com.skyBooker.passenger.dto.PassengerRequest;
import com.skyBooker.passenger.dto.PassengerResponse;
import com.skyBooker.passenger.entity.Passenger;
import com.skyBooker.passenger.service.PassengerService;
import com.skyBooker.passenger.validation.PassengerValidationPatterns;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/passengers")
@RequiredArgsConstructor
@Validated
public class PassengerController {

    private final PassengerService passengerService;

    @PostMapping
    public ResponseEntity<PassengerResponse> createPassenger(@Valid @RequestBody PassengerRequest request) {
        Passenger passenger = mapToEntity(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(passengerService.createPassenger(passenger)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PassengerResponse> getPassengerById(@PathVariable @Positive(message = "id must be positive") Long id) {
        return ResponseEntity.ok(mapToResponse(passengerService.getPassengerById(id)));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<PassengerResponse>> getPassengersByBookingId(@PathVariable @Positive(message = "bookingId must be positive") Long bookingId) {
        return ResponseEntity.ok(passengerService.getPassengersByBookingId(bookingId).stream().map(this::mapToResponse).collect(Collectors.toList()));
    }

    @GetMapping("/passport/{passportNumber}")
    public ResponseEntity<PassengerResponse> getPassengerByPassportNumber(
            @PathVariable
            @Pattern(regexp = PassengerValidationPatterns.PASSPORT, message = "Passport number format is invalid")
            String passportNumber
    ) {
        return ResponseEntity.ok(mapToResponse(passengerService.getPassengerByPassportNumber(passportNumber)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PassengerResponse> updatePassenger(
            @PathVariable @Positive(message = "id must be positive") Long id,
            @Valid @RequestBody PassengerRequest request
    ) {
        Passenger passenger = mapToEntity(request);
        return ResponseEntity.ok(mapToResponse(passengerService.updatePassenger(id, passenger)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePassenger(@PathVariable @Positive(message = "id must be positive") Long id) {
        passengerService.deletePassenger(id);
        return ResponseEntity.noContent().build();
    }

    private Passenger mapToEntity(PassengerRequest request) {
        Passenger passenger = new Passenger();
        passenger.setBookingId(request.getBookingId());
        passenger.setFirstName(request.getFirstName());
        passenger.setLastName(request.getLastName());
        passenger.setPassportNumber(request.getPassportNumber());
        passenger.setDateOfBirth(request.getDateOfBirth());
        passenger.setCategory(request.getCategory());
        passenger.setGender(request.getGender());
        passenger.setNationality(request.getNationality());
        passenger.setSpecialRequests(request.getSpecialRequests());
        return passenger;
    }

    private PassengerResponse mapToResponse(Passenger passenger) {
        return new PassengerResponse(
                passenger.getId(),
                passenger.getBookingId(),
                passenger.getFirstName(),
                passenger.getLastName(),
                passenger.getPassportNumber(),
                passenger.getDateOfBirth(),
                passenger.getCategory(),
                passenger.getGender(),
                passenger.getNationality(),
                passenger.getSpecialRequests(),
                passenger.getCreatedAt(),
                passenger.getUpdatedAt()
        );
    }
}
