package com.skyBooker.seat.dto;

import com.skyBooker.seat.entity.Seat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatResponse {
    private Long id;
    private Long flightId;
    private String seatNumber;
    private Seat.SeatClass seatClass;
    private Seat.SeatStatus status;
    private Long passengerId;
    private Long bookingId;
    private LocalDateTime holdExpiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
