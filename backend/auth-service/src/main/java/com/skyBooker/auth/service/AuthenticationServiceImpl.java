package com.skyBooker.auth.service;

import com.skyBooker.auth.config.GoogleOAuthProvider;
import com.skyBooker.auth.config.JwtProvider;
import com.skyBooker.auth.dto.*;
import com.skyBooker.auth.entity.User;
import com.skyBooker.auth.exception.AuthException;
import com.skyBooker.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    // ================= REGISTER =================
    @Override
    public AuthResponse register(RegistrationRequest request) {
        if (request == null) {
            throw new AuthException("Registration request is required", "INVALID_REQUEST");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
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
        user.setAuthProvider(User.AuthProvider.LOCAL);
        user.setRole(mapRole(request.getRole()));
        user.setIsActive(true);

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
        User user = userRepository.findByEmailAndIsActiveTrue(request.getEmail())
                .orElseThrow(() -> new AuthException("User not found", "USER_NOT_FOUND"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthException("Invalid password", "INVALID_PASSWORD");
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
        User existingUser = getUserById(userId);

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

        return userRepository.save(existingUser);
    }

    // ================= DELETE (SOFT DELETE) =================
    @Override
    public void deleteUser(Long userId) {
        User user = getUserById(userId); // already checks active
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

        User user = userRepository.findByEmail(payload.getEmail()).orElse(null);
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
            return; // Fail silently for security
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
}
