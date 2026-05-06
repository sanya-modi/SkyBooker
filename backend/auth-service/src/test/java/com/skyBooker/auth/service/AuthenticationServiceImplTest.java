package com.skyBooker.auth.service;

import com.skyBooker.auth.config.GoogleOAuthProvider;
import com.skyBooker.auth.config.JwtProvider;
import com.skyBooker.auth.dto.*;
import com.skyBooker.auth.entity.User;
import com.skyBooker.auth.exception.AuthException;
import com.skyBooker.auth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtProvider jwtProvider;
    @Mock private GoogleOAuthProvider googleOAuthProvider;
    @Mock private NotificationPublisher notificationPublisher;
    @Mock private RestTemplate restTemplate;

    @InjectMocks
    private AuthenticationServiceImpl service;

    // ================= REGISTER =================

    @Test
    void registerSuccess() {
        RegistrationRequest req = new RegistrationRequest("John","Doe","john@test.com","pass","999", RegistrationRequest.UserRole.PASSENGER,null,null,null);

        when(userRepository.findByEmail("john@test.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("pass")).thenReturn("encoded");
        when(jwtProvider.generateToken(any(), any())).thenReturn("token");
        when(userRepository.save(any())).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setId(1L);
            return u;
        });

        AuthResponse res = service.register(req);

        assertThat(res.getUserId()).isEqualTo(1L);
        verify(notificationPublisher).publishSignupEvent(any(), any(), any());
    }

    @Test
    void registerThrowsWhenNullRequest() {
        assertThatThrownBy(() -> service.register(null))
                .isInstanceOf(AuthException.class)
                .hasMessageContaining("Registration request is required");
    }

    @Test
    void registerThrowsWhenEmailExists() {
        User existingUser = new User();
        existingUser.setIsActive(true);
        existingUser.setRole(User.UserRole.PASSENGER);
        
        when(userRepository.findByEmail("john@test.com")).thenReturn(Optional.of(existingUser));

        RegistrationRequest req = new RegistrationRequest();
        req.setEmail("john@test.com");

        assertThatThrownBy(() -> service.register(req))
                .isInstanceOf(AuthException.class)
                .hasMessageContaining("Email already exists");
    }

    @Test
    void registerThrowsWhenInactiveUserExists() {
        User existingUser = new User();
        existingUser.setIsActive(false);
        existingUser.setRole(User.UserRole.PASSENGER);
        
        when(userRepository.findByEmail("john@test.com")).thenReturn(Optional.of(existingUser));

        RegistrationRequest req = new RegistrationRequest();
        req.setEmail("john@test.com");

        assertThatThrownBy(() -> service.register(req))
                .isInstanceOf(AuthException.class)
                .hasMessageContaining("deactivated");
    }

    @Test
    void registerWithAdminRole() {
        RegistrationRequest req = new RegistrationRequest("Admin","User","admin@test.com","pass","999", RegistrationRequest.UserRole.ADMIN,null,null,null);

        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("pass")).thenReturn("encoded");
        when(jwtProvider.generateToken(any(), any())).thenReturn("token");
        when(userRepository.save(any())).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setId(2L);
            return u;
        });

        AuthResponse res = service.register(req);

        assertThat(res.getUserId()).isEqualTo(2L);
        verify(userRepository).save(argThat(u -> u.getRole() == User.UserRole.ADMIN));
    }

    @Test
    void registerWithNullRoleDefaultsToPassenger() {
        RegistrationRequest req = new RegistrationRequest("John","Doe","john@test.com","pass","999", null,null,null,null);

        when(userRepository.findByEmail("john@test.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("pass")).thenReturn("encoded");
        when(jwtProvider.generateToken(any(), any())).thenReturn("token");
        when(userRepository.save(any())).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setId(1L);
            return u;
        });

        service.register(req);

        verify(userRepository).save(argThat(u -> u.getRole() == User.UserRole.PASSENGER));
    }

    // ================= LOGIN =================

    @Test
    void loginSuccess() {
        User user = new User();
        user.setId(1L);
        user.setEmail("john@test.com");
        user.setPassword("encoded");
        user.setRole(User.UserRole.PASSENGER);
        user.setIsActive(true);
        user.setFirstName("John");

        when(userRepository.findByEmailWithAirline("john@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pass","encoded")).thenReturn(true);
        when(jwtProvider.generateToken(any(), any())).thenReturn("token");

        AuthResponse res = service.login(new AuthRequest("john@test.com","pass"));

        assertThat(res.getToken()).isEqualTo("token");
        verify(notificationPublisher).publishLoginEvent(any(), any(), any(), any());
    }

    @Test
    void loginUserNotFound() {
        when(userRepository.findByEmailWithAirline("x")).thenReturn(Optional.empty());

        AuthRequest request = new AuthRequest("x","p");
        
        assertThatThrownBy(() -> service.login(request))
                .isInstanceOf(AuthException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void loginInactiveUser() {
        User user = new User();
        user.setIsActive(false);

        when(userRepository.findByEmailWithAirline("x")).thenReturn(Optional.of(user));

        AuthRequest request = new AuthRequest("x","p");
        
        assertThatThrownBy(() -> service.login(request))
                .isInstanceOf(AuthException.class)
                .hasMessageContaining("inactive");
    }

    @Test
    void loginWrongPassword() {
        User user = new User();
        user.setIsActive(true);
        user.setPassword("encoded");

        when(userRepository.findByEmailWithAirline("x")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("p","encoded")).thenReturn(false);

        AuthRequest request = new AuthRequest("x","p");
        
        assertThatThrownBy(() -> service.login(request))
                .isInstanceOf(AuthException.class)
                .hasMessageContaining("Invalid password");
    }

    // ================= USER =================

    @Test
    void getUserByIdSuccess() {
        User user = new User();
        user.setId(1L);
        
        when(userRepository.findByIdAndIsActiveTrue(1L)).thenReturn(Optional.of(user));

        assertThat(service.getUserById(1L)).isNotNull();
    }

    @Test
    void getUserByIdThrows() {
        when(userRepository.findByIdAndIsActiveTrue(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getUserById(1L))
                .isInstanceOf(AuthException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void getUserByEmailSuccess() {
        User user = new User();
        user.setEmail("test@test.com");
        
        when(userRepository.findByEmailAndIsActiveTrue("test@test.com")).thenReturn(Optional.of(user));

        assertThat(service.getUserByEmail("test@test.com")).isNotNull();
    }

    @Test
    void getUserByEmailThrows() {
        when(userRepository.findByEmailAndIsActiveTrue("test@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getUserByEmail("test@test.com"))
                .isInstanceOf(AuthException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void getAllActiveUsers() {
        when(userRepository.findByIsActiveTrue()).thenReturn(List.of(new User(), new User()));

        assertThat(service.getAllActiveUsers()).hasSize(2);
    }

    // ================= UPDATE =================

    @Test
    void updateUserPartial() {
        User user = new User();
        user.setId(1L);

        UpdateUserRequest req = new UpdateUserRequest();
        req.setFirstName("New");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        User result = service.updateUser(1L, req);

        assertThat(result.getFirstName()).isEqualTo("New");
    }

    @Test
    void updateUserAllFields() {
        User user = new User();
        user.setId(1L);

        UpdateUserRequest req = new UpdateUserRequest();
        req.setFirstName("First");
        req.setLastName("Last");
        req.setPhoneNumber("123");
        req.setPassportNumber("ABC123");
        req.setNationality("US");
        req.setProfilePhotoUrl("http://photo.url");
        req.setIsActive(false);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        User result = service.updateUser(1L, req);

        assertThat(result.getFirstName()).isEqualTo("First");
        assertThat(result.getLastName()).isEqualTo("Last");
        assertThat(result.getPhoneNumber()).isEqualTo("123");
        assertThat(result.getPassportNumber()).isEqualTo("ABC123");
        assertThat(result.getNationality()).isEqualTo("US");
        assertThat(result.getProfilePhotoUrl()).isEqualTo("http://photo.url");
        assertThat(result.getIsActive()).isFalse();
    }

    @Test
    void updateUserNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        UpdateUserRequest req = new UpdateUserRequest();
        
        assertThatThrownBy(() -> service.updateUser(1L, req))
                .isInstanceOf(AuthException.class)
                .hasMessageContaining("User not found");
    }

    // ================= DELETE =================

    @Test
    void deleteUserSoftDelete() {
        User user = new User();
        user.setId(1L);
        user.setIsActive(true);

        when(userRepository.findByIdAndIsActiveTrue(1L)).thenReturn(Optional.of(user));

        service.deleteUser(1L);

        assertThat(user.getIsActive()).isFalse();
        verify(userRepository).save(user);
    }

    // ================= GOOGLE LOGIN =================

    @Test
    void loginWithGoogleNewUser() {
        GoogleTokenPayload payload = GoogleTokenPayload.builder()
                .email("google@test.com")
                .name("Google User")
                .sub("google123")
                .build();

        when(googleOAuthProvider.getTokenPayload("token")).thenReturn(payload);
        when(userRepository.findByEmailWithAirline("google@test.com")).thenReturn(Optional.empty());
        when(userRepository.save(any())).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setId(1L);
            return u;
        });
        when(jwtProvider.generateToken(any(), any())).thenReturn("jwt");

        AuthResponse res = service.loginWithGoogle(new GoogleLoginRequest("token"));

        assertThat(res.getUserId()).isEqualTo(1L);
        verify(notificationPublisher).publishSignupEvent(any(), any(), any());
        verify(notificationPublisher).publishLoginEvent(any(), any(), any(), any());
    }

    @Test
    void loginWithGoogleExistingUser() {
        GoogleTokenPayload payload = GoogleTokenPayload.builder()
                .email("google@test.com")
                .name("Google User")
                .sub("google123")
                .build();

        User existingUser = new User();
        existingUser.setId(1L);
        existingUser.setEmail("google@test.com");
        existingUser.setAuthProvider(User.AuthProvider.GOOGLE);
        existingUser.setRole(User.UserRole.PASSENGER);
        existingUser.setIsActive(true);
        existingUser.setFirstName("Google");

        when(googleOAuthProvider.getTokenPayload("token")).thenReturn(payload);
        when(userRepository.findByEmailWithAirline("google@test.com")).thenReturn(Optional.of(existingUser));
        when(jwtProvider.generateToken(any(), any())).thenReturn("jwt");

        AuthResponse res = service.loginWithGoogle(new GoogleLoginRequest("token"));

        assertThat(res.getUserId()).isEqualTo(1L);
        verify(notificationPublisher, never()).publishSignupEvent(any(), any(), any());
        verify(notificationPublisher).publishLoginEvent(any(), any(), any(), any());
    }

    @Test
    void loginWithGoogleInvalidToken() {
        when(googleOAuthProvider.getTokenPayload("invalid")).thenReturn(null);

        assertThatThrownBy(() -> service.loginWithGoogle(new GoogleLoginRequest("invalid")))
                .isInstanceOf(AuthException.class)
                .hasMessageContaining("Invalid Google token");
    }

    @Test
    void loginWithGoogleInactiveUser() {
        GoogleTokenPayload payload = GoogleTokenPayload.builder()
                .email("google@test.com")
                .name("Google User")
                .sub("google123")
                .build();

        User existingUser = new User();
        existingUser.setIsActive(false);
        existingUser.setAuthProvider(User.AuthProvider.GOOGLE);

        when(googleOAuthProvider.getTokenPayload("token")).thenReturn(payload);
        when(userRepository.findByEmailWithAirline("google@test.com")).thenReturn(Optional.of(existingUser));

        assertThatThrownBy(() -> service.loginWithGoogle(new GoogleLoginRequest("token")))
                .isInstanceOf(AuthException.class)
                .hasMessageContaining("inactive");
    }

    // ================= FORGOT PASSWORD =================

    @Test
    void forgotPasswordSkipsWhenUserNotFound() {
        when(userRepository.findByEmail("x")).thenReturn(Optional.empty());

        service.forgotPassword("x");

        verify(userRepository, never()).save(any());
    }

    @Test
    void forgotPasswordSkipsWhenUserInactive() {
        User user = new User();
        user.setIsActive(false);
        
        when(userRepository.findByEmail("x")).thenReturn(Optional.of(user));

        service.forgotPassword("x");

        verify(userRepository, never()).save(any());
    }

    @Test
    void forgotPasswordThrowsForGoogleUser() {
        User user = new User();
        user.setIsActive(true);
        user.setAuthProvider(User.AuthProvider.GOOGLE);

        when(userRepository.findByEmail("x")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> service.forgotPassword("x"))
                .isInstanceOf(AuthException.class)
                .hasMessageContaining("Google");
    }

    @Test
    void forgotPasswordSuccess() {
        User user = new User();
        user.setIsActive(true);
        user.setAuthProvider(User.AuthProvider.LOCAL);
        user.setEmail("test@test.com");
        user.setFirstName("Test");

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));

        service.forgotPassword("test@test.com");

        verify(userRepository).save(argThat(u -> u.getResetToken() != null));
        verify(notificationPublisher).publishPasswordResetEvent(any(), any(), any());
    }

    // ================= RESET PASSWORD =================

    @Test
    void resetPasswordSuccess() {
        User user = new User();
        user.setResetToken("token");
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(10));
        user.setEmail("test@test.com");
        user.setFirstName("Test");

        when(userRepository.findByResetToken("token")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("new")).thenReturn("encoded");

        service.resetPassword("token","new");

        verify(userRepository).save(argThat(u -> u.getResetToken() == null));
        verify(notificationPublisher).publishPasswordResetSuccessEvent(any(), any());
    }

    @Test
    void resetPasswordExpired() {
        User user = new User();
        user.setResetToken("token");
        user.setResetTokenExpiry(LocalDateTime.now().minusMinutes(1));

        when(userRepository.findByResetToken("token")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> service.resetPassword("token","new"))
                .isInstanceOf(AuthException.class)
                .hasMessageContaining("expired");
    }

    @Test
    void resetPasswordInvalidToken() {
        when(userRepository.findByResetToken("invalid")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.resetPassword("invalid","new"))
                .isInstanceOf(AuthException.class)
                .hasMessageContaining("Invalid or expired");
    }

    @Test
    void resetPasswordNullExpiry() {
        User user = new User();
        user.setResetToken("token");
        user.setResetTokenExpiry(null);

        when(userRepository.findByResetToken("token")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> service.resetPassword("token","new"))
                .isInstanceOf(AuthException.class)
                .hasMessageContaining("expired");
    }

    @Test
    void loginWithGoogleConvertsLocalToGoogle() {
        GoogleTokenPayload payload = GoogleTokenPayload.builder()
                .email("local@test.com")
                .name("Local User")
                .sub("google456")
                .build();

        User existingUser = new User();
        existingUser.setId(2L);
        existingUser.setEmail("local@test.com");
        existingUser.setAuthProvider(User.AuthProvider.LOCAL);
        existingUser.setRole(User.UserRole.PASSENGER);
        existingUser.setIsActive(true);
        existingUser.setFirstName("Local");

        when(googleOAuthProvider.getTokenPayload("token")).thenReturn(payload);
        when(userRepository.findByEmailWithAirline("local@test.com")).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any())).thenReturn(existingUser);
        when(jwtProvider.generateToken(any(), any())).thenReturn("jwt");

        service.loginWithGoogle(new GoogleLoginRequest("token"));

        verify(userRepository).save(argThat(u -> u.getAuthProvider() == User.AuthProvider.GOOGLE));
    }

    @Test
    void getAllActiveUsersEmpty() {
        when(userRepository.findByIsActiveTrue()).thenReturn(List.of());

        assertThat(service.getAllActiveUsers()).isEmpty();
    }

    @Test
    void updateUserOnlyFirstName() {
        User user = new User();
        user.setId(1L);
        user.setLastName("Original");

        UpdateUserRequest req = new UpdateUserRequest();
        req.setFirstName("Updated");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        User result = service.updateUser(1L, req);

        assertThat(result.getFirstName()).isEqualTo("Updated");
        assertThat(result.getLastName()).isEqualTo("Original");
    }
}
