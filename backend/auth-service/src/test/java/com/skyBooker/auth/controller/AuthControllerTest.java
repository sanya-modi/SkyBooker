package com.skyBooker.auth.controller;

import com.skyBooker.auth.dto.AuthRequest;
import com.skyBooker.auth.dto.AuthResponse;
import com.skyBooker.auth.dto.ForgotPasswordRequest;
import com.skyBooker.auth.dto.GoogleLoginRequest;
import com.skyBooker.auth.dto.RegistrationRequest;
import com.skyBooker.auth.dto.ResetPasswordRequest;
import com.skyBooker.auth.dto.UpdateUserRequest;
import com.skyBooker.auth.dto.UserResponse;
import com.skyBooker.auth.entity.User;
import com.skyBooker.auth.service.AuthenticationService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthControllerTest {

    private final AuthenticationService authenticationService = mock(AuthenticationService.class);
    private final AuthController controller = new AuthController(authenticationService);

    @Test
    void registerReturnsBadRequestWhenBodyIsNull() {
        ResponseEntity<AuthResponse> response = controller.register(null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNull();
    }

    @Test
    void registerReturnsCreatedResponse() {
        RegistrationRequest request = validRegistrationRequest();
        AuthResponse authResponse = new AuthResponse(1L, "john@test.com", "token", "PASSENGER");
        when(authenticationService.register(request)).thenReturn(authResponse);

        ResponseEntity<AuthResponse> response = controller.register(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(authResponse);
    }

    @Test
    void loginReturnsServiceResponse() {
        AuthRequest request = new AuthRequest("john@test.com", "Pass@123");
        AuthResponse authResponse = new AuthResponse(1L, "john@test.com", "token", "PASSENGER");
        when(authenticationService.login(request)).thenReturn(authResponse);

        ResponseEntity<AuthResponse> response = controller.login(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(authResponse);
    }

    @Test
    void loginWithGoogleReturnsServiceResponse() {
        GoogleLoginRequest request = new GoogleLoginRequest("header.payload.signature");
        AuthResponse authResponse = new AuthResponse(2L, "google@test.com", "token", "PASSENGER");
        when(authenticationService.loginWithGoogle(request)).thenReturn(authResponse);

        ResponseEntity<AuthResponse> response = controller.loginWithGoogle(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(authResponse);
    }

    @Test
    void getAllUsersMapsEntitiesToResponses() {
        when(authenticationService.getAllActiveUsers()).thenReturn(List.of(sampleUser()));

        ResponseEntity<List<UserResponse>> response = controller.getAllUsers();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).singleElement().satisfies(user -> {
            assertThat(user.getEmail()).isEqualTo("john@test.com");
            assertThat(user.getRole()).isEqualTo(User.UserRole.PASSENGER);
        });
    }

    @Test
    void getUserByIdMapsEntityToResponse() {
        when(authenticationService.getUserById(1L)).thenReturn(sampleUser());

        ResponseEntity<UserResponse> response = controller.getUserById(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getFirstName()).isEqualTo("John");
    }

    @Test
    void getUserByEmailMapsEntityToResponse() {
        when(authenticationService.getUserByEmail("john@test.com")).thenReturn(sampleUser());

        ResponseEntity<UserResponse> response = controller.getUserByEmail("john@test.com");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getLastName()).isEqualTo("Doe");
    }

    @Test
    void updateUserMapsEntityToResponse() {
        UpdateUserRequest request = new UpdateUserRequest("John", "Doe", "9876543210", "A1234567", "Indian", "https://img", true);
        when(authenticationService.updateUser(1L, request)).thenReturn(sampleUser());

        ResponseEntity<UserResponse> response = controller.updateUser(1L, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getPhoneNumber()).isEqualTo("9876543210");
    }

    @Test
    void deleteUserReturnsNoContent() {
        ResponseEntity<Void> response = controller.deleteUser(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(authenticationService).deleteUser(1L);
    }

    @Test
    void forgotPasswordDelegatesEmailAndReturnsOk() {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("john@test.com");

        ResponseEntity<Void> response = controller.forgotPassword(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(authenticationService).forgotPassword("john@test.com");
    }

    @Test
    void resetPasswordDelegatesFieldsAndReturnsOk() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("reset-token");
        request.setNewPassword("Secret1!");

        ResponseEntity<Void> response = controller.resetPassword(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(authenticationService).resetPassword("reset-token", "Secret1!");
    }

    @Test
    void updateUserPassesExactArgumentsToService() {
        UpdateUserRequest request = new UpdateUserRequest("Jane", "Doe", "1234567890", "P123456", "Indian", "https://photo", false);
        when(authenticationService.updateUser(7L, request)).thenReturn(sampleUser());

        controller.updateUser(7L, request);

        ArgumentCaptor<UpdateUserRequest> captor = ArgumentCaptor.forClass(UpdateUserRequest.class);
        verify(authenticationService).updateUser(org.mockito.ArgumentMatchers.eq(7L), captor.capture());
        assertThat(captor.getValue()).isEqualTo(request);
    }

    private RegistrationRequest validRegistrationRequest() {
        return new RegistrationRequest(
                "John",
                "Doe",
                "john@test.com",
                "Pass@123",
                "9876543210",
                RegistrationRequest.UserRole.PASSENGER,
                "A1234567",
                "Indian",
                null
        );
    }

    private User sampleUser() {
        User user = new User();
        user.setId(1L);
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setEmail("john@test.com");
        user.setPhoneNumber("9876543210");
        user.setPassportNumber("A1234567");
        user.setNationality("Indian");
        user.setProfilePhotoUrl("https://img");
        user.setAirlineId(5L);
        user.setAuthProvider(User.AuthProvider.LOCAL);
        user.setRole(User.UserRole.PASSENGER);
        user.setIsActive(true);
        return user;
    }
}
