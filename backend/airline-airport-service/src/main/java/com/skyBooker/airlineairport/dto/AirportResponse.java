package com.skyBooker.airlineairport.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AirportResponse {
    private Long id;
    private String name;
    private String iataCode;
    private String city;
    private String country;
    private String description;
    private String phoneNumber;
    private String email;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
