package com.skyBooker.flight.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlightPassengerManifestResponse {
    private Long id;
    private Long bookingId;
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String seat;
    private String passport;
    private boolean blocked;
    private String bookedByName;
    private String bookedByEmail;
    private String bookedByPhone;
}
