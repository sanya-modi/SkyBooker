package com.skyBooker.passenger.service;

import com.skyBooker.passenger.entity.Passenger;

import java.util.List;

public interface PassengerService {
    Passenger createPassenger(Passenger passenger);
    Passenger getPassengerById(Long id);
    List<Passenger> getPassengersByBookingId(Long bookingId);
    Passenger getPassengerByPassportNumber(String passportNumber);
    Passenger updatePassenger(Long id, Passenger passengerData);
    void deletePassenger(Long id);
}
