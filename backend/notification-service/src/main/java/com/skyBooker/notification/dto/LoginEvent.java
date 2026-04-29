package com.skyBooker.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginEvent {
    private String email;
    private String firstName;
    private LocalDateTime loginTime;
    private String ipAddress;
    private String device;
}
