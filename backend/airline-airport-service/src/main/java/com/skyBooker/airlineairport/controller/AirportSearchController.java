package com.skyBooker.airlineairport.controller;

import com.skyBooker.airlineairport.dto.AirportResponse;
import com.skyBooker.airlineairport.entity.Airport;
import com.skyBooker.airlineairport.service.AirportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/airports")
@RequiredArgsConstructor
public class AirportSearchController {

    private final AirportService airportService;

    @GetMapping("/search")
    public ResponseEntity<List<AirportResponse>> searchAirports(@RequestParam(required = false) String q) {
        if (q == null || q.trim().length() < 2) {
            return ResponseEntity.ok(List.of());
        }
        
        return ResponseEntity.ok(airportService.searchCities(q.trim()).stream()
                .map(this::mapToResponse)
                .toList());
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
