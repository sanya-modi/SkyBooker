package com.skyBooker.seat.dto;

import com.skyBooker.seat.entity.Seat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatClassConfigResponse {
    private Long id;
    private Long flightId;
    private Integer startRow;
    private Integer endRow;
    private Seat.SeatClass seatClass;
}
