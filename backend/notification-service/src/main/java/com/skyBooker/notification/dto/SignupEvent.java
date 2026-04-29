package com.skyBooker.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SignupEvent {
    private String email;
    private String firstName;
    private String lastName;
}
