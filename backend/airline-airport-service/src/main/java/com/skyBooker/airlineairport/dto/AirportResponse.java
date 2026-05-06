package com.skybooker.airlineairport.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("isActive")
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
