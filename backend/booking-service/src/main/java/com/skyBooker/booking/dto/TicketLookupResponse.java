package com.skyBooker.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketLookupResponse {
    private BookingResponse booking;
    private FlightSummary flight;
    private List<PassengerSummary> passengers;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FlightSummary {
        private Long id;
        private String flightNumber;
        private String aircraftType;
        private Long airlineId;
        private Long departureAirportId;
        private Long arrivalAirportId;
        private String departureTime;
        private String arrivalTime;
        private Integer totalSeats;
        private Integer availableSeats;
        private String status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PassengerSummary {
        private Long id;
        private Long bookingId;
        private String firstName;
        private String lastName;
        private String email;
        private String phoneNumber;
        private String passportNumber;
        private String dateOfBirth;
        private String category;
        private String gender;
        private String nationality;
        private String specialRequests;
    }
}
