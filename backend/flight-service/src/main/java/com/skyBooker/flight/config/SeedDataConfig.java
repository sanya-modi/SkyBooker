package com.skyBooker.flight.config;

import com.skyBooker.flight.entity.Flight;
import com.skyBooker.flight.repository.FlightRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class SeedDataConfig {

    // Airport IDs (seeded by airline-airport-service):
    // 1=DEL, 2=BOM, 3=BLR, 4=HYD, 5=MAA, 6=CCU, 7=COK, 8=PNQ, 9=AMD, 10=GOI, 11=JAI, 12=GAU
    // Airline IDs: 1=IndiGo(6E), 2=AirIndia(AI), 3=AkasaAir(QP), 4=SpiceJet(SG), 5=Vistara(UK)

    private static final long[][] ROUTES = {
        {1,2},{2,1},{1,3},{3,1},{1,4},{4,1},{1,5},{5,1},{1,6},{6,1},
        {1,7},{7,1},{1,8},{8,1},{1,9},{9,1},{1,10},{10,1},{1,11},{11,1},
        {2,3},{3,2},{2,4},{4,2},{2,5},{5,2},{2,6},{6,2},{2,7},{7,2},
        {2,9},{9,2},{2,10},{10,2},{3,4},{4,3},{3,5},{5,3},{3,6},{6,3},
        {4,5},{5,4},{4,6},{6,4},{5,6},{6,5},{6,12},{12,6}
    };

    private static final int[][] SCHEDULES = {
        {5,30},{7,0},{9,15},{11,45},{14,0},{16,30},{18,50},{21,10}
    };

    private static final long[] AIRLINES = {1L,2L,3L,4L,5L};
    private static final String[] AIRCRAFT = {"A320","A321","B737","A320neo","B737MAX"};
    private static final String[] PREFIXES = {"6E","AI","QP","SG","UK"};
    private static final int[] BASE_FARES = {3500,4200,5100,6300,7800,9500,11000,13500};

    @Bean
    CommandLineRunner seedFlights(FlightRepository flightRepository) {
        return args -> {
            if (flightRepository.count() > 0) return;

            List<Flight> flights = new ArrayList<>();
            LocalDate today = LocalDate.now();
            int flightCounter = 100;

            for (int dayOffset = 0; dayOffset <= 30; dayOffset++) {
                LocalDate date = today.plusDays(dayOffset);
                for (long[] route : ROUTES) {
                    long depId = route[0];
                    long arrId = route[1];
                    int scheduleCount = (dayOffset % 3 == 0) ? SCHEDULES.length : SCHEDULES.length / 2;
                    for (int s = 0; s < scheduleCount; s++) {
                        int[] sched = SCHEDULES[s];
                        int airlineIdx = (int)((depId + arrId + s) % AIRLINES.length);
                        long airlineId = AIRLINES[airlineIdx];
                        String prefix = PREFIXES[airlineIdx];
                        String aircraft = AIRCRAFT[airlineIdx];
                        int fareIdx = (int)((depId + arrId + s + dayOffset) % BASE_FARES.length);
                        int baseFare = BASE_FARES[fareIdx] + (dayOffset * 50);

                        LocalDateTime dep = date.atTime(sched[0], sched[1]);
                        int flightMins = 60 + (int)((depId + arrId) * 15) % 120;
                        LocalDateTime arr = dep.plusMinutes(flightMins);

                        String flightNum = prefix + flightCounter++;
                        flights.add(buildFlight(flightNum, aircraft, airlineId, depId, arrId, dep, arr, 180, baseFare));
                    }
                }
            }

            flightRepository.saveAll(flights);
        };
    }

    private Flight buildFlight(String flightNumber, String aircraftType, Long airlineId,
            Long departureAirportId, Long arrivalAirportId,
            LocalDateTime departureTime, LocalDateTime arrivalTime,
            int totalSeats, int baseFare) {
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


            ensureFlight(flightRepository, "6E201", "A320", 1L, 1L, 2L, startDate.atTime(6, 30), startDate.atTime(8, 45), 180, 5200);
            ensureFlight(flightRepository, "AI204", "A320", 2L, 1L, 2L, startDate.atTime(10, 0), startDate.atTime(12, 10), 180, 5700);
            ensureFlight(flightRepository, "QP206", "B737", 3L, 1L, 2L, startDate.atTime(18, 20), startDate.atTime(20, 35), 186, 4950);
            ensureFlight(flightRepository, "AI302", "A321", 2L, 2L, 1L, startDate.atTime(9, 15), startDate.atTime(11, 30), 180, 5600);
            ensureFlight(flightRepository, "6E304", "A321", 1L, 2L, 1L, startDate.atTime(14, 10), startDate.atTime(16, 20), 180, 5100);
            ensureFlight(flightRepository, "QP306", "B737", 3L, 2L, 1L, startDate.atTime(20, 25), startDate.atTime(22, 35), 186, 4850);
            ensureFlight(flightRepository, "QP411", "B737", 3L, 1L, 3L, startDate.atTime(12, 0), startDate.atTime(14, 35), 186, 6100);
            ensureFlight(flightRepository, "6E413", "A320", 1L, 1L, 3L, startDate.atTime(7, 45), startDate.atTime(10, 20), 180, 5800);
            ensureFlight(flightRepository, "AI415", "A321", 2L, 1L, 3L, startDate.atTime(19, 0), startDate.atTime(21, 30), 180, 6400);
            ensureFlight(flightRepository, "AI501", "A320", 2L, 3L, 1L, startDate.plusDays(1).atTime(9, 0), startDate.plusDays(1).atTime(11, 35), 180, 6000);
            ensureFlight(flightRepository, "QP503", "B737", 3L, 3L, 1L, startDate.plusDays(1).atTime(17, 15), startDate.plusDays(1).atTime(19, 45), 186, 5550);
            ensureFlight(flightRepository, "6E512", "A320", 1L, 3L, 5L, startDate.plusDays(1).atTime(7, 20), startDate.plusDays(1).atTime(8, 30), 180, 4300);
            ensureFlight(flightRepository, "QP514", "B737", 3L, 3L, 5L, startDate.plusDays(1).atTime(13, 10), startDate.plusDays(1).atTime(14, 20), 186, 4550);
            ensureFlight(flightRepository, "AI623", "A320", 2L, 5L, 3L, startDate.plusDays(1).atTime(10, 10), startDate.plusDays(1).atTime(11, 25), 180, 4500);
            ensureFlight(flightRepository, "6E625", "A320", 1L, 5L, 3L, startDate.plusDays(1).atTime(18, 0), startDate.plusDays(1).atTime(19, 15), 180, 4250);
            ensureFlight(flightRepository, "QP734", "B737", 3L, 4L, 1L, startDate.plusDays(1).atTime(18, 10), startDate.plusDays(1).atTime(20, 25), 186, 5400);
            ensureFlight(flightRepository, "AI736", "A320", 2L, 4L, 1L, startDate.plusDays(1).atTime(7, 5), startDate.plusDays(1).atTime(9, 20), 180, 5650);
            ensureFlight(flightRepository, "6E845", "A321", 1L, 2L, 8L, startDate.plusDays(2).atTime(6, 50), startDate.plusDays(2).atTime(8, 55), 180, 3900);
            ensureFlight(flightRepository, "AI847", "A320", 2L, 2L, 8L, startDate.plusDays(2).atTime(16, 20), startDate.plusDays(2).atTime(18, 25), 180, 4300);
            ensureFlight(flightRepository, "AI956", "A320", 2L, 8L, 3L, startDate.plusDays(2).atTime(14, 0), startDate.plusDays(2).atTime(15, 35), 180, 4100);
            ensureFlight(flightRepository, "6E958", "A320", 1L, 8L, 3L, startDate.plusDays(2).atTime(8, 15), startDate.plusDays(2).atTime(9, 45), 180, 3850);
            ensureFlight(flightRepository, "QP167", "B737", 3L, 6L, 2L, startDate.plusDays(2).atTime(20, 10), startDate.plusDays(2).atTime(22, 55), 186, 6400);
            ensureFlight(flightRepository, "AI278", "A321", 2L, 7L, 1L, startDate.plusDays(3).atTime(8, 40), startDate.plusDays(3).atTime(11, 35), 180, 6800);
            ensureFlight(flightRepository, "6E280", "A320", 1L, 7L, 1L, startDate.plusDays(3).atTime(15, 30), startDate.plusDays(3).atTime(18, 20), 180, 6450);
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
