package com.skyBooker.auth.service;

import com.skyBooker.auth.config.GoogleOAuthProvider;
import com.skyBooker.auth.config.JwtProvider;
import com.skyBooker.auth.dto.*;
import com.skyBooker.auth.entity.User;
import com.skyBooker.auth.exception.AuthException;
import com.skyBooker.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final GoogleOAuthProvider googleOAuthProvider;
    private final NotificationPublisher notificationPublisher;
    private final RestTemplate restTemplate;

    @Value("${services.airline-airport.base-url:http://localhost:8082}")
    private String airlineAirportServiceBaseUrl;

    // ================= REGISTER =================
    @Override
    public AuthResponse register(RegistrationRequest request) {
        if (request == null) {
            throw new AuthException("Registration request is required", "INVALID_REQUEST");
        }

        User existingUser = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (existingUser != null) {
            if (!Boolean.TRUE.equals(existingUser.getIsActive())
                    && (User.UserRole.PASSENGER.equals(existingUser.getRole())
                    || User.UserRole.AIRLINE_STAFF.equals(existingUser.getRole()))) {
                throw new AuthException("This account has been deactivated by admin. Please contact support.", "USER_INACTIVE");
            }
            throw new AuthException("Email already exists", "EMAIL_EXISTS");
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPassportNumber(request.getPassportNumber());
        user.setNationality(request.getNationality());
        user.setAirlineId(request.getAirlineId());
        user.setAuthProvider(User.AuthProvider.LOCAL);
        user.setRole(mapRole(request.getRole()));
        user.setIsActive(true);

        if (User.UserRole.AIRLINE_STAFF.equals(user.getRole()) && user.getAirlineId() != null) {
            validateAirlineActive(user.getAirlineId());
        }

        User savedUser = userRepository.save(user);
        
        notificationPublisher.publishSignupEvent(savedUser.getEmail(), savedUser.getFirstName(), savedUser.getLastName());

        String token = jwtProvider.generateToken(
                savedUser.getEmail(),
                savedUser.getRole().toString()
        );

        return new AuthResponse(
                savedUser.getId(),
                savedUser.getEmail(),
                token,
                savedUser.getRole().toString()
        );
    }

    private User.UserRole mapRole(RegistrationRequest.UserRole role) {
        if (role == null) {
            return User.UserRole.PASSENGER;
        }

        return switch (role) {
            case ADMIN -> User.UserRole.ADMIN;
            case AIRLINE_STAFF -> User.UserRole.AIRLINE_STAFF;
            case PASSENGER -> User.UserRole.PASSENGER;
        };
    }

    // ================= LOGIN =================
    @Override
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmailWithAirline(request.getEmail())
                .orElseThrow(() -> new AuthException("User not found", "USER_NOT_FOUND"));

        if (!user.getIsActive()) {
            throw new AuthException("User account is inactive", "USER_INACTIVE");
        }

        System.out.println("[AUTH] Login attempt - Email: " + user.getEmail() + ", Role: " + user.getRole() + ", AirlineId: " + user.getAirlineId());

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthException("Invalid password", "INVALID_PASSWORD");
        }

        if (User.UserRole.AIRLINE_STAFF.equals(user.getRole()) && user.getAirlineId() != null) {
            validateAirlineActive(user.getAirlineId());
        }
        
        notificationPublisher.publishLoginEvent(user.getEmail(), user.getFirstName(), "Unknown", "Web Browser");

        String token = jwtProvider.generateToken(
                user.getEmail(),
                user.getRole().toString()
        );

        System.out.println("[AUTH] Login successful - Email: " + user.getEmail());

        return new AuthResponse(
                user.getId(),
                user.getEmail(),
                token,
                user.getRole().toString()
        );
    }

    // ================= GET USER =================
    @Override
    @Transactional(readOnly = true)
    public User getUserById(Long userId) {
        return userRepository.findByIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new AuthException("User not found", "USER_NOT_FOUND"));
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new AuthException("User not found", "USER_NOT_FOUND"));
    }

    @Transactional(readOnly = true)
    public List<User> getAllActiveUsers() {
        return userRepository.findByIsActiveTrue();
    }

    // ================= UPDATE =================
    @Override
    public User updateUser(Long userId, UpdateUserRequest user) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found", "USER_NOT_FOUND"));

        if (user.getFirstName() != null) {
            existingUser.setFirstName(user.getFirstName());
        }
        if (user.getLastName() != null) {
            existingUser.setLastName(user.getLastName());
        }
        if (user.getPhoneNumber() != null) {
            existingUser.setPhoneNumber(user.getPhoneNumber());
        }
        if (user.getPassportNumber() != null) {
            existingUser.setPassportNumber(user.getPassportNumber());
        }
        if (user.getNationality() != null) {
            existingUser.setNationality(user.getNationality());
        }
        if (user.getProfilePhotoUrl() != null) {
            existingUser.setProfilePhotoUrl(user.getProfilePhotoUrl());
        }
        if (user.getIsActive() != null) {
            existingUser.setIsActive(user.getIsActive());
        }

        return userRepository.save(existingUser);
    }

    // ================= DELETE (SOFT DELETE) =================
    @Override
    public void deleteUser(Long userId) {
        User user = getUserById(userId);
        user.setIsActive(false);
        userRepository.save(user);
    }

    // ================= GOOGLE LOGIN =================
    @Override
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        GoogleTokenPayload payload = googleOAuthProvider.getTokenPayload(request.getIdToken());

        if (payload == null) {
            throw new AuthException("Invalid Google token", "INVALID_GOOGLE_TOKEN");
        }

        User user = userRepository.findByEmailWithAirline(payload.getEmail()).orElse(null);
        boolean isNewUser = false;

        if (user == null) {
            user = new User();
            user.setEmail(payload.getEmail());
            user.setFirstName(payload.getName() != null ? payload.getName().split(" ")[0] : "");
            user.setLastName(payload.getName() != null && payload.getName().split(" ").length > 1
                    ? payload.getName().split(" ", 2)[1] : "");
            user.setGoogleId(payload.getSub());
            user.setAuthProvider(User.AuthProvider.GOOGLE);
                user.setRole(User.UserRole.PASSENGER);
            user.setIsActive(true);

            user = userRepository.save(user);
            isNewUser = true;
        } else if (!User.AuthProvider.GOOGLE.equals(user.getAuthProvider())) {
            user.setAuthProvider(User.AuthProvider.GOOGLE);
            user.setGoogleId(payload.getSub());
            user = userRepository.save(user);
        }

        if (!user.getIsActive()) {
            throw new AuthException("User account is inactive", "USER_INACTIVE");
        }

        if (User.UserRole.AIRLINE_STAFF.equals(user.getRole()) && user.getAirlineId() != null) {
            validateAirlineActive(user.getAirlineId());
        }

        if (isNewUser) {
            notificationPublisher.publishSignupEvent(user.getEmail(), user.getFirstName(), user.getLastName());
        }
        notificationPublisher.publishLoginEvent(user.getEmail(), user.getFirstName(), "Unknown", "Web Browser");

        String token = jwtProvider.generateToken(
                user.getEmail(),
                user.getRole().toString()
        );

        return new AuthResponse(
                user.getId(),
                user.getEmail(),
                token,
                user.getRole().toString()
        );
    }

    // ================= PASSWORD RESET =================
    @Override
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || !user.getIsActive()) {
            return;
        }

        if (User.AuthProvider.GOOGLE.equals(user.getAuthProvider())) {
            throw new AuthException("You signed up with Google. Please use 'Continue with Google' to log in.", "INVALID_AUTH_PROVIDER");
        }

        String token = java.util.UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(java.time.LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        notificationPublisher.publishPasswordResetEvent(user.getEmail(), user.getFirstName(), token);
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new AuthException("Invalid or expired reset token", "INVALID_TOKEN"));

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new AuthException("Reset token has expired", "TOKEN_EXPIRED");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        notificationPublisher.publishPasswordResetSuccessEvent(user.getEmail(), user.getFirstName());
    }

    private void validateAirlineActive(Long airlineId) {
        try {
            String url = airlineAirportServiceBaseUrl + "/airlines/" + airlineId;
            System.out.println("[AUTH] Validating airline ID: " + airlineId);
            
            var response = restTemplate.getForEntity(url, AirlineResponse.class);
            
            if (response.getBody() != null) {
                Boolean isActive = response.getBody().getIsActive();
                String airlineName = response.getBody().getName();
                
                System.out.println("[AUTH] Airline validation - ID: " + airlineId + ", Name: " + airlineName + ", Active: " + isActive);
                
                if (isActive == null || !isActive) {
                    throw new AuthException("Your airline (" + airlineName + ") is currently inactive. Please contact support.", "AIRLINE_INACTIVE");
                }
            }
        } catch (AuthException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("[AUTH] Error validating airline: " + e.getMessage());
            throw new AuthException("Unable to verify airline status. Please try again.", "AIRLINE_VALIDATION_ERROR");
        }
    }
    
    private static class AirlineResponse {
        private Long id;
        private String name;
        private String iataCode;
        private String description;
        private String phoneNumber;
        private String email;
        private Boolean isActive;
        private String createdAt;
        private String updatedAt;
        
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getIataCode() { return iataCode; }
        public void setIataCode(String iataCode) { this.iataCode = iataCode; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public Boolean getIsActive() { return isActive; }
        public void setIsActive(Boolean isActive) { this.isActive = isActive; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
        public String getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
    }
}
