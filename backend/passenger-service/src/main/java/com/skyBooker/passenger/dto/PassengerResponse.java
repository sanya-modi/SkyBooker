package com.skyBooker.passenger.dto;

import com.skyBooker.passenger.entity.Passenger;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PassengerResponse {
    private Long id;
    private Long bookingId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String passportNumber;
    private LocalDate dateOfBirth;
    private Passenger.Category category;
    private Passenger.Gender gender;
    private String nationality;
    private String specialRequests;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
