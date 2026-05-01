package com.skyBooker.flight.dto.remote;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlightStatusNotificationRequest {
    private String flightNumber;
    private String route;
    private String status;
    private String message;
    private List<Recipient> recipients;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Recipient {
        private Long userId;
        private Long bookingId;
        private String email;
    }
}
