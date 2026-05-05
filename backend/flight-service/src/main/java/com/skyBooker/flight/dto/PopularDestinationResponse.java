package com.skyBooker.flight.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PopularDestinationResponse {
    private String destinationName;
    private String airportCode;
    private String imageUrl;
}
