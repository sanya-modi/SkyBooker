package com.skyBooker.auth.dto;

import com.skyBooker.auth.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String passportNumber;
    private String nationality;
    private String profilePhotoUrl;
    private Long airlineId;
    private User.AuthProvider authProvider;
    private User.UserRole role;
    private Boolean isActive;
}
