package com.skyBooker.passenger.service;

import com.skyBooker.passenger.entity.Passenger;
import com.skyBooker.passenger.repository.PassengerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PassengerServiceImpl implements PassengerService {

    private final PassengerRepository passengerRepository;

    @Override
    public Passenger createPassenger(Passenger passenger) {
        return passengerRepository.save(passenger);
    }

    @Override
    @Transactional(readOnly = true)
    public Passenger getPassengerById(Long id) {
        return passengerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Passenger not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Passenger> getPassengersByBookingId(Long bookingId) {
        return passengerRepository.findByBookingId(bookingId);
    }

    @Override
    @Transactional(readOnly = true)
    public Passenger getPassengerByPassportNumber(String passportNumber) {
        Passenger passenger = passengerRepository.findByPassportNumber(passportNumber);
        if (passenger == null) {
            throw new RuntimeException("Passenger not found");
        }
        return passenger;
    }

    @Override
    public Passenger updatePassenger(Long id, Passenger passengerData) {
        Passenger passenger = getPassengerById(id);
        if (passengerData.getFirstName() != null) {
            passenger.setFirstName(passengerData.getFirstName());
        }
        if (passengerData.getLastName() != null) {
            passenger.setLastName(passengerData.getLastName());
        }
        if (passengerData.getSpecialRequests() != null) {
            passenger.setSpecialRequests(passengerData.getSpecialRequests());
        }
        return passengerRepository.save(passenger);
    }

    @Override
    public void deletePassenger(Long id) {
        passengerRepository.deleteById(id);
    }
}
