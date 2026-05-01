package com.skyBooker.flight.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatConfigRequest {
    private List<SeatClassRangeRequest> ranges;
}
