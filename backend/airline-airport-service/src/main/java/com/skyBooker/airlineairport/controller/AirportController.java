package com.skyBooker.airlineairport.controller;

import com.skyBooker.airlineairport.dto.AirportRequest;
import com.skyBooker.airlineairport.dto.AirportResponse;
import com.skyBooker.airlineairport.entity.Airport;
import com.skyBooker.airlineairport.service.AirportService;
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
@RequestMapping("/airports")
@RequiredArgsConstructor
@Validated
public class AirportController {

    private final AirportService airportService;

    @PostMapping
    public ResponseEntity<AirportResponse> createAirport(@Valid @RequestBody AirportRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(airportService.createAirport(mapToEntity(request))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AirportResponse> getAirportById(@PathVariable @Positive(message = "id must be positive") Long id) {
        return ResponseEntity.ok(mapToResponse(airportService.getAirportById(id)));
    }

    @GetMapping("/iata/{iataCode}")
    public ResponseEntity<AirportResponse> getAirportByIataCode(
            @PathVariable
            @Pattern(regexp = AirlineAirportValidationPatterns.IATA_CODE_AIRPORT, message = "IATA code must be 3 uppercase letters")
            String iataCode
    ) {
        return ResponseEntity.ok(mapToResponse(airportService.getAirportByIataCode(iataCode)));
    }

    @GetMapping
    public ResponseEntity<List<AirportResponse>> getAllAirports(
            @RequestParam(required = false, defaultValue = "false") Boolean includeInactive
    ) {
        return ResponseEntity.ok(airportService.getAllAirports(includeInactive).stream()
                .map(this::mapToResponse)
                .toList());
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<AirportResponse>> getAirportsByCity(
            @PathVariable
            @Pattern(regexp = AirlineAirportValidationPatterns.CITY_COUNTRY, message = "City format is invalid")
            String city
    ) {
        return ResponseEntity.ok(airportService.getAirportsByCity(city).stream().map(this::mapToResponse).toList());
    }

    @GetMapping("/country/{country}")
    public ResponseEntity<List<AirportResponse>> getAirportsByCountry(
            @PathVariable
            @Pattern(regexp = AirlineAirportValidationPatterns.CITY_COUNTRY, message = "Country format is invalid")
            String country
    ) {
        return ResponseEntity.ok(airportService.getAirportsByCountry(country).stream().map(this::mapToResponse).toList());
    }

    @PutMapping("/{id}")
    public ResponseEntity<AirportResponse> updateAirport(
            @PathVariable @Positive(message = "id must be positive") Long id,
            @Valid @RequestBody AirportRequest request
    ) {
        return ResponseEntity.ok(mapToResponse(airportService.updateAirport(id, mapToEntity(request))));
    }

    @GetMapping("/{id}/active")
    public ResponseEntity<Void> checkAirportActive(@PathVariable @Positive(message = "id must be positive") Long id) {
        Airport airport = airportService.getAirportById(id);
        if (!airport.getIsActive()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAirport(@PathVariable @Positive(message = "id must be positive") Long id) {
        airportService.deleteAirport(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search/by-city")
    public ResponseEntity<List<AirportResponse>> searchCities(
            @RequestParam String searchTerm
    ) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(airportService.searchCities(searchTerm.trim()).stream().map(this::mapToResponse).toList());
    }

    private Airport mapToEntity(AirportRequest request) {
        Airport airport = new Airport();
        airport.setName(request.getName());
        airport.setIataCode(request.getIataCode());
        airport.setCity(request.getCity());
        airport.setCountry(request.getCountry());
        airport.setDescription(request.getDescription());
        airport.setPhoneNumber(request.getPhoneNumber());
        airport.setEmail(request.getEmail());
        if (request.getIsActive() != null) {
            airport.setIsActive(request.getIsActive());
        }
        return airport;
    }

    private AirportResponse mapToResponse(Airport airport) {
        return new AirportResponse(
                airport.getId(),
                airport.getName(),
                airport.getIataCode(),
                airport.getCity(),
                airport.getCountry(),
                airport.getDescription(),
                airport.getPhoneNumber(),
                airport.getEmail(),
                airport.getIsActive(),
                airport.getCreatedAt(),
                airport.getUpdatedAt()
        );
    }
}
