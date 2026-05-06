package com.skybooker.airlineairport.dto;

import com.skybooker.airlineairport.validation.AirlineAirportValidationPatterns;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AirportRequest {

    @NotBlank(message = "Airport name is required")
    @Pattern(regexp = AirlineAirportValidationPatterns.NAME, message = "Airport name format is invalid")
    private String name;

    @NotBlank(message = "IATA code is required")
    @Pattern(regexp = AirlineAirportValidationPatterns.IATA_CODE_AIRPORT, message = "IATA code must be 3 uppercase letters")
    private String iataCode;

    @NotBlank(message = "City is required")
    @Pattern(regexp = AirlineAirportValidationPatterns.CITY_COUNTRY, message = "City format is invalid")
    private String city;

    @NotBlank(message = "Country is required")
    @Pattern(regexp = AirlineAirportValidationPatterns.CITY_COUNTRY, message = "Country format is invalid")
    private String country;

    @Pattern(regexp = AirlineAirportValidationPatterns.DESCRIPTION, message = "Description format is invalid")
    private String description;

    @Pattern(regexp = AirlineAirportValidationPatterns.PHONE, message = "Phone format is invalid")
    private String phoneNumber;

    @Pattern(regexp = AirlineAirportValidationPatterns.EMAIL, message = "Email format is invalid")
    private String email;

    @JsonProperty("isActive")
    private Boolean isActive;
}
