package com.skyBooker.seat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatCountUpdateEvent {
    private Long flightId;
    private Integer totalSeats;
    private Integer bookedSeats;
    private Integer availableSeats;
}
