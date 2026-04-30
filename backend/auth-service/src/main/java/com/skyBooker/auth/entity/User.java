package com.skyBooker.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @jakarta.validation.constraints.NotBlank(message = "First name is required")
    @jakarta.validation.constraints.Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    @Column(nullable = false, length = 100)
    private String firstName;

    @jakarta.validation.constraints.NotBlank(message = "Last name is required")
    @jakarta.validation.constraints.Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    @Column(nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = true)
    private String password;

    @jakarta.validation.constraints.Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be exactly 10 digits")
    @Column(nullable = true, length = 20)
    private String phoneNumber;

    @Column(nullable = true, length = 20)
    private String passportNumber;

    @Column(nullable = true, length = 50)
    private String nationality;

    @jakarta.validation.constraints.Size(max = 1000, message = "Profile photo URL must not exceed 1000 characters")
    @Column(nullable = true, length = 1000)
    private String profilePhotoUrl;

    @Column(nullable = true)
    private Long airlineId;

    @Column(nullable = true, unique = true)
    private String googleId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthProvider authProvider;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(nullable = true, length = 100)
    private String resetToken;

    @Column(nullable = true)
    private LocalDateTime resetTokenExpiry;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum UserRole {
        PASSENGER, ADMIN, AIRLINE_STAFF
    }

    public enum AuthProvider {
        LOCAL, GOOGLE
    }
}
