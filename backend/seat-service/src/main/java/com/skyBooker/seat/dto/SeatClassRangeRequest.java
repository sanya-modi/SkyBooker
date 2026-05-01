package com.skyBooker.seat.dto;

import com.skyBooker.seat.entity.Seat;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatClassRangeRequest {

    @NotNull(message = "startRow is required")
    @Positive(message = "startRow must be positive")
    private Integer startRow;

    @NotNull(message = "endRow is required")
    @Positive(message = "endRow must be positive")
    private Integer endRow;

    @NotNull(message = "seatClass is required")
    private Seat.SeatClass seatClass;
}
