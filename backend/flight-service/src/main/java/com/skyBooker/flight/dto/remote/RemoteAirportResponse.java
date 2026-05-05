package com.skyBooker.flight.dto.remote;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RemoteAirportResponse {
    private Long id;
    private String name;
    private String iataCode;
    private String city;
    private String country;
}
