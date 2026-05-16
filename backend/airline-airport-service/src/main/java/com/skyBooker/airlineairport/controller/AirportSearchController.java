package com.skyBooker.airlineairport.controller;

import com.skyBooker.airlineairport.entity.Airport;
import com.skyBooker.airlineairport.repository.AirportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/airports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AirportSearchController {

    private final AirportRepository airportRepository;

    @GetMapping("/search")
    public ResponseEntity<List<Airport>> searchAirports(@RequestParam(required = false) String q) {
        if (q == null || q.trim().isEmpty() || q.trim().length() < 2) {
            return ResponseEntity.ok(List.of());
        }
        
        String searchTerm = q.trim();
        List<Airport> results = airportRepository.searchByCity(searchTerm);
        return ResponseEntity.ok(results);
    }
}
