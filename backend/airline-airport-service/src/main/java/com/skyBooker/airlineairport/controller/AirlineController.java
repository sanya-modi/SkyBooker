package com.skyBooker.airlineairport.controller;

import com.skyBooker.airlineairport.dto.AirlineRequest;
import com.skyBooker.airlineairport.dto.AirlineResponse;
import com.skyBooker.airlineairport.entity.Airline;
import com.skyBooker.airlineairport.service.AirlineService;
import com.skyBooker.airlineairport.validation.AirlineAirportValidationPatterns;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/airlines")
@RequiredArgsConstructor
@Validated
public class AirlineController {

    private final AirlineService airlineService;

    @PostMapping
    public ResponseEntity<AirlineResponse> createAirline(@Valid @RequestBody AirlineRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(airlineService.createAirline(mapToEntity(request))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AirlineResponse> getAirlineById(@PathVariable @Positive(message = "id must be positive") Long id) {
        return ResponseEntity.ok(mapToResponse(airlineService.getAirlineById(id)));
    }

    @GetMapping("/iata/{iataCode}")
    public ResponseEntity<AirlineResponse> getAirlineByIataCode(
            @PathVariable
            @Pattern(regexp = AirlineAirportValidationPatterns.IATA_CODE_AIRLINE, message = "IATA code must be 2-3 uppercase letters or digits")
            String iataCode
    ) {
        return ResponseEntity.ok(mapToResponse(airlineService.getAirlineByIataCode(iataCode)));
    }

    @GetMapping
    public ResponseEntity<List<AirlineResponse>> getAllAirlines(
            @RequestParam(required = false, defaultValue = "false") Boolean includeInactive
    ) {
        return ResponseEntity.ok(airlineService.getAllAirlines(includeInactive).stream()
                .map(this::mapToResponse)
                .toList());
    }

    @PutMapping("/{id}")
    public ResponseEntity<AirlineResponse> updateAirline(
            @PathVariable @Positive(message = "id must be positive") Long id,
            @Valid @RequestBody AirlineRequest request
    ) {
        return ResponseEntity.ok(mapToResponse(airlineService.updateAirline(id, mapToEntity(request))));
    }

    @GetMapping("/{id}/active")
    public ResponseEntity<Void> checkAirlineActive(@PathVariable @Positive(message = "id must be positive") Long id) {
        Airline airline = airlineService.getAirlineById(id);
        if (!airline.getIsActive()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAirline(@PathVariable @Positive(message = "id must be positive") Long id) {
        airlineService.deleteAirline(id);
        return ResponseEntity.noContent().build();
    }

    private Airline mapToEntity(AirlineRequest request) {
        Airline airline = new Airline();
        airline.setName(request.getName());
        airline.setIataCode(request.getIataCode());
        airline.setDescription(request.getDescription());
        airline.setPhoneNumber(request.getPhoneNumber());
        airline.setEmail(request.getEmail());
        if (request.getIsActive() != null) {
            airline.setIsActive(request.getIsActive());
        }
        return airline;
    }

    private AirlineResponse mapToResponse(Airline airline) {
        return new AirlineResponse(
                airline.getId(),
                airline.getName(),
                airline.getIataCode(),
                airline.getDescription(),
                airline.getPhoneNumber(),
                airline.getEmail(),
                airline.getIsActive(),
                airline.getCreatedAt(),
                airline.getUpdatedAt()
        );
    }
}
