package com.skyBooker.flight.dto.remote;

import lombok.Data;

@Data
public class RemoteUserResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private Long airlineId;
    private String role;
    private Boolean isActive;
}
