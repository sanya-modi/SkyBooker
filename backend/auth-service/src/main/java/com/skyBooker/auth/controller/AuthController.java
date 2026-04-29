package com.skyBooker.auth.controller;

import com.skyBooker.auth.dto.AuthRequest;
import com.skyBooker.auth.dto.AuthResponse;
import com.skyBooker.auth.dto.GoogleLoginRequest;
import com.skyBooker.auth.dto.RegistrationRequest;
import com.skyBooker.auth.dto.UpdateUserRequest;
import com.skyBooker.auth.dto.UserResponse;
import com.skyBooker.auth.entity.User;
import com.skyBooker.auth.service.AuthenticationService;
import com.skyBooker.auth.validation.ValidationPatterns;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {

    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody(required = false) RegistrationRequest request) {
        if (request == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(authenticationService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authenticationService.login(request));
    }

    @PostMapping("/login/google")
    public ResponseEntity<AuthResponse> loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(authenticationService.loginWithGoogle(request));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable @Positive(message = "userId must be positive") Long userId) {
        return ResponseEntity.ok(mapToUserResponse(authenticationService.getUserById(userId)));
    }

    @GetMapping("/users/email/{email}")
    public ResponseEntity<UserResponse> getUserByEmail(
            @PathVariable
            @Email(message = "Email should be valid")
            @Pattern(regexp = ValidationPatterns.EMAIL, message = "Email format is invalid")
            String email
    ) {
        return ResponseEntity.ok(mapToUserResponse(authenticationService.getUserByEmail(email)));
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable @Positive(message = "userId must be positive") Long userId,
            @Valid @RequestBody UpdateUserRequest user
    ) {
        return ResponseEntity.ok(mapToUserResponse(authenticationService.updateUser(userId, user)));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable @Positive(message = "userId must be positive") Long userId) {
        authenticationService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getPassportNumber(),
                user.getNationality(),
                user.getAuthProvider(),
                user.getRole(),
                user.getIsActive()
        );
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody com.skyBooker.auth.dto.ForgotPasswordRequest request) {
        authenticationService.forgotPassword(request.getEmail());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody com.skyBooker.auth.dto.ResetPasswordRequest request) {
        authenticationService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }
}
