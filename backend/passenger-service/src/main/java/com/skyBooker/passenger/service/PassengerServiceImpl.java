package com.skyBooker.passenger.service;

import com.skyBooker.passenger.entity.Passenger;
import com.skyBooker.passenger.repository.PassengerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PassengerServiceImpl implements PassengerService {

    private final PassengerRepository passengerRepository;

    @Override
    public Passenger createPassenger(Passenger passenger) {
        validatePassengerCategoryAge(passenger.getDateOfBirth(), passenger.getCategory());
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
        if (passengerData.getDateOfBirth() != null) {
            passenger.setDateOfBirth(passengerData.getDateOfBirth());
        }
        if (passengerData.getCategory() != null) {
            passenger.setCategory(passengerData.getCategory());
        }
        if (passengerData.getGender() != null) {
            passenger.setGender(passengerData.getGender());
        }
        if (passengerData.getPassportNumber() != null) {
            passenger.setPassportNumber(passengerData.getPassportNumber());
        }
        if (passengerData.getNationality() != null) {
            passenger.setNationality(passengerData.getNationality());
        }
        validatePassengerCategoryAge(passenger.getDateOfBirth(), passenger.getCategory());
        return passengerRepository.save(passenger);
    }

    @Override
    public void deletePassenger(Long id) {
        passengerRepository.deleteById(id);
    }

    private void validatePassengerCategoryAge(LocalDate dateOfBirth, Passenger.Category category) {
        int age = Period.between(dateOfBirth, LocalDate.now()).getYears();
        if (age < 0) {
            throw new IllegalArgumentException("Date of birth cannot be in the future");
        }

        switch (category) {
            case ADULT -> {
                if (age <= 12) {
                    throw new IllegalArgumentException("Passenger must be older than 12 years");
                }
            }
            case CHILD -> {
                if (age < 2 || age > 12) {
                    throw new IllegalArgumentException("Passenger age must be between 2 and 12 years");
                }
            }
            case INFANT -> {
                if (age >= 2) {
                    throw new IllegalArgumentException("Passenger must be below 2 years");
                }
            }
            default -> throw new IllegalArgumentException("Invalid passenger category");
        }
    }
}
