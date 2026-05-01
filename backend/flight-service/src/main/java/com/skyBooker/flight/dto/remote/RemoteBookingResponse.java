package com.skyBooker.flight.dto.remote;

import lombok.Data;

import java.util.List;

@Data
public class RemoteBookingResponse {
    private Long id;
    private String pnr;
    private Long userId;
    private Long flightId;
    private Integer numberOfPassengers;
    private String status;
    private List<String> selectedSeats;
}
