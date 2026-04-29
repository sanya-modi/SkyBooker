package com.skyBooker.auth.service;

import com.skyBooker.auth.dto.AuthRequest;
import com.skyBooker.auth.dto.AuthResponse;
import com.skyBooker.auth.dto.GoogleLoginRequest;
import com.skyBooker.auth.dto.RegistrationRequest;
import com.skyBooker.auth.dto.UpdateUserRequest;
import com.skyBooker.auth.entity.User;

public interface AuthenticationService {
    AuthResponse register(RegistrationRequest request);
    AuthResponse login(AuthRequest request);
    AuthResponse loginWithGoogle(GoogleLoginRequest request);
    User getUserById(Long userId);
    User getUserByEmail(String email);
    User updateUser(Long userId, UpdateUserRequest user);
    void deleteUser(Long userId);
    void forgotPassword(String email);
    void resetPassword(String token, String newPassword);
}
