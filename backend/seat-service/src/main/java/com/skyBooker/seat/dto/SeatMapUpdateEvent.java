package com.skyBooker.seat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatMapUpdateEvent {
    private Long flightId;
    private String eventType;
    private LocalDateTime timestamp;
    private List<SeatResponse> seats;
    private List<SeatClassConfigResponse> configs;
}
