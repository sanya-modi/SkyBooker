package com.skyBooker.flight.dto.remote;

import lombok.Data;

@Data
public class RemotePassengerResponse {
    private Long id;
    private Long bookingId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String passportNumber;
}
