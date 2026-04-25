package com.skyBooker.seat.service;

import com.skyBooker.seat.entity.Seat;

import java.util.List;

public interface SeatService {
    void initializeSeatsForFlight(Long flightId, Integer totalSeats);
    List<Seat> getAllSeatsByFlight(Long flightId);
    List<Seat> getAvailableSeats(Long flightId);
    List<Seat> getAvailableSeatsByClass(Long flightId, Seat.SeatClass seatClass);
    Seat holdSeat(Long flightId, String seatNumber, Long passengerId);
    Seat bookSeat(Long flightId, String seatNumber, Long bookingId, Long passengerId);
    void releaseSeat(Long seatId);
    Seat getSeatById(Long seatId);
    List<Seat> getSeatsbyBookingId(Long bookingId);
    void releaseExpiredHolds();
}
