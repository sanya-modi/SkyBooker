package com.skyBooker.airlineairport.dto;

import com.skyBooker.airlineairport.validation.AirlineAirportValidationPatterns;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AirlineRequest {

    @NotBlank(message = "Airline name is required")
    @Pattern(regexp = AirlineAirportValidationPatterns.NAME, message = "Airline name format is invalid")
    private String name;

    @NotBlank(message = "IATA code is required")
    @Pattern(regexp = AirlineAirportValidationPatterns.IATA_CODE_AIRLINE, message = "IATA code must be 2-3 uppercase letters or digits")
    private String iataCode;

    @Pattern(regexp = AirlineAirportValidationPatterns.DESCRIPTION, message = "Description format is invalid")
    private String description;

    @Pattern(regexp = AirlineAirportValidationPatterns.PHONE, message = "Phone format is invalid")
    private String phoneNumber;

    @Pattern(regexp = AirlineAirportValidationPatterns.EMAIL, message = "Email format is invalid")
    private String email;

    @JsonProperty("isActive")
    private Boolean isActive;
}
