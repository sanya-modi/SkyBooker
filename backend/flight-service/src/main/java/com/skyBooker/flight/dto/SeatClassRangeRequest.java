package com.skyBooker.flight.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatClassRangeRequest {
    private Integer startRow;
    private Integer endRow;
    private String seatClass;
}
