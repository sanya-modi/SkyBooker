package com.skyBooker.flight.config;

import com.skyBooker.flight.entity.Flight;
import com.skyBooker.flight.repository.FlightRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Configuration
public class SeedDataConfig {

    @Bean
    CommandLineRunner seedFlights(FlightRepository flightRepository) {
        return args -> {

            if (flightRepository.count() > 0) return;

            LocalDate startDate = LocalDate.now();

            // Sample Flights (clean + controlled data)
            ensureFlight(flightRepository, "6E201", "A320", 1L, 1L, 2L, startDate.atTime(6, 30), startDate.atTime(8, 45), 180, 5200);
            ensureFlight(flightRepository, "AI204", "A320", 2L, 1L, 2L, startDate.atTime(10, 0), startDate.atTime(12, 10), 180, 5700);
            ensureFlight(flightRepository, "QP206", "B737", 3L, 1L, 2L, startDate.atTime(18, 20), startDate.atTime(20, 35), 186, 4950);

            ensureFlight(flightRepository, "AI302", "A321", 2L, 2L, 1L, startDate.atTime(9, 15), startDate.atTime(11, 30), 180, 5600);
            ensureFlight(flightRepository, "6E304", "A321", 1L, 2L, 1L, startDate.atTime(14, 10), startDate.atTime(16, 20), 180, 5100);

            ensureFlight(flightRepository, "QP411", "B737", 3L, 1L, 3L, startDate.atTime(12, 0), startDate.atTime(14, 35), 186, 6100);
            ensureFlight(flightRepository, "6E413", "A320", 1L, 1L, 3L, startDate.atTime(7, 45), startDate.atTime(10, 20), 180, 5800);

            ensureFlight(flightRepository, "AI501", "A320", 2L, 3L, 1L, startDate.plusDays(1).atTime(9, 0), startDate.plusDays(1).atTime(11, 35), 180, 6000);
            ensureFlight(flightRepository, "QP503", "B737", 3L, 3L, 1L, startDate.plusDays(1).atTime(17, 15), startDate.plusDays(1).atTime(19, 45), 186, 5550);

            ensureFlight(flightRepository, "6E512", "A320", 1L, 3L, 5L, startDate.plusDays(1).atTime(7, 20), startDate.plusDays(1).atTime(8, 30), 180, 4300);

            ensureFlight(flightRepository, "AI623", "A320", 2L, 5L, 3L, startDate.plusDays(1).atTime(10, 10), startDate.plusDays(1).atTime(11, 25), 180, 4500);

            ensureFlight(flightRepository, "QP734", "B737", 3L, 4L, 1L, startDate.plusDays(1).atTime(18, 10), startDate.plusDays(1).atTime(20, 25), 186, 5400);

            ensureFlight(flightRepository, "AI736", "A320", 2L, 4L, 1L, startDate.plusDays(1).atTime(7, 5), startDate.plusDays(1).atTime(9, 20), 180, 5650);

            ensureFlight(flightRepository, "6E845", "A321", 1L, 2L, 8L, startDate.plusDays(2).atTime(6, 50), startDate.plusDays(2).atTime(8, 55), 180, 3900);

            ensureFlight(flightRepository, "AI847", "A320", 2L, 2L, 8L, startDate.plusDays(2).atTime(16, 20), startDate.plusDays(2).atTime(18, 25), 180, 4300);

            ensureFlight(flightRepository, "AI956", "A320", 2L, 8L, 3L, startDate.plusDays(2).atTime(14, 0), startDate.plusDays(2).atTime(15, 35), 180, 4100);

            ensureFlight(flightRepository, "QP167", "B737", 3L, 6L, 2L, startDate.plusDays(2).atTime(20, 10), startDate.plusDays(2).atTime(22, 55), 186, 6400);

            ensureFlight(flightRepository, "AI278", "A321", 2L, 7L, 1L, startDate.plusDays(3).atTime(8, 40), startDate.plusDays(3).atTime(11, 35), 180, 6800);

        };
    }

    private void ensureFlight(
            FlightRepository flightRepository,
            String flightNumber,
            String aircraftType,
            Long airlineId,
            Long departureAirportId,
            Long arrivalAirportId,
            LocalDateTime departureTime,
            LocalDateTime arrivalTime,
            int totalSeats,
            int baseFare
    ) {
        if (flightRepository.findByFlightNumber(flightNumber).isEmpty()) {
            flightRepository.save(buildFlight(
                    flightNumber,
                    aircraftType,
                    airlineId,
                    departureAirportId,
                    arrivalAirportId,
                    departureTime,
                    arrivalTime,
                    totalSeats,
                    baseFare
            ));
        }
    }

    private Flight buildFlight(
            String flightNumber,
            String aircraftType,
            Long airlineId,
            Long departureAirportId,
            Long arrivalAirportId,
            LocalDateTime departureTime,
            LocalDateTime arrivalTime,
            int totalSeats,
            int baseFare
    ) {
        Flight flight = new Flight();
        flight.setFlightNumber(flightNumber);
        flight.setAircraftType(aircraftType);
        flight.setAirlineId(airlineId);
        flight.setDepartureAirportId(departureAirportId);
        flight.setArrivalAirportId(arrivalAirportId);
        flight.setDepartureTime(departureTime);
        flight.setArrivalTime(arrivalTime);
        flight.setTotalSeats(totalSeats);
        flight.setAvailableSeats(totalSeats);
        flight.setBaseFare(BigDecimal.valueOf(baseFare));
        flight.setStatus(Flight.FlightStatus.ON_TIME);
        return flight;
    }
}