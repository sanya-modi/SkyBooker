package com.skyBooker.auth.dto;

import com.skyBooker.auth.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserSummaryResponse {
    private Long id;
    private String name;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private User.AuthProvider authProvider;
    private User.UserRole role;
    private Boolean isActive;
    private String airline;
}
