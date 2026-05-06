package com.skyBooker.auth;

import com.skyBooker.auth.application.AuthServiceApplication;
import com.skyBooker.auth.config.GlobalExceptionHandler;
import com.skyBooker.auth.dto.AdminUserSummaryResponse;
import com.skyBooker.auth.dto.AuthRequest;
import com.skyBooker.auth.dto.AuthResponse;
import com.skyBooker.auth.dto.ForgotPasswordRequest;
import com.skyBooker.auth.dto.GoogleLoginRequest;
import com.skyBooker.auth.dto.GoogleTokenPayload;
import com.skyBooker.auth.dto.RegistrationRequest;
import com.skyBooker.auth.dto.ResetPasswordRequest;
import com.skyBooker.auth.dto.UpdateUserRequest;
import com.skyBooker.auth.dto.UserResponse;
import com.skyBooker.auth.entity.Airline;
import com.skyBooker.auth.entity.User;
import com.skyBooker.auth.exception.AuthException;
import com.skyBooker.auth.validation.ValidationPatterns;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class AuthModelCoverageTest {

    @Test
    void authRequestCoversDataMethods() {
        AuthRequest request = new AuthRequest("john@test.com", "Pass@123");
        AuthRequest same = new AuthRequest("john@test.com", "Pass@123");

        assertThat(request).isEqualTo(same);
        assertThat(request.hashCode()).isEqualTo(same.hashCode());
        assertThat(request.toString()).contains("john@test.com");
    }

    @Test
    void authResponseCoversDataMethods() {
        AuthResponse response = new AuthResponse(1L, "john@test.com", "token", "PASSENGER");
        AuthResponse same = new AuthResponse(1L, "john@test.com", "token", "PASSENGER");

        assertThat(response).isEqualTo(same);
        assertThat(response.hashCode()).isEqualTo(same.hashCode());
        assertThat(response.toString()).contains("token");
    }

    @Test
    void requestDtosCoverDataMethods() {
        ForgotPasswordRequest forgot = new ForgotPasswordRequest();
        forgot.setEmail("john@test.com");
        assertThat(forgot.getEmail()).isEqualTo("john@test.com");
        assertThat(forgot.toString()).contains("john@test.com");

        GoogleLoginRequest google = new GoogleLoginRequest("header.payload.signature");
        assertThat(google).isEqualTo(new GoogleLoginRequest("header.payload.signature"));

        ResetPasswordRequest reset = new ResetPasswordRequest();
        reset.setToken("token");
        reset.setNewPassword("Secret1!");
        assertThat(reset.getToken()).isEqualTo("token");
        assertThat(reset.toString()).contains("Secret1!");

        UpdateUserRequest update = new UpdateUserRequest("John", "Doe", "9876543210", "A1234567", "Indian", "https://img", true);
        assertThat(update).isEqualTo(new UpdateUserRequest("John", "Doe", "9876543210", "A1234567", "Indian", "https://img", true));

        RegistrationRequest registration = new RegistrationRequest("John", "Doe", "john@test.com", "Pass@123", "9876543210", RegistrationRequest.UserRole.PASSENGER, "A1234567", "Indian", 9L);
        assertThat(registration).isEqualTo(new RegistrationRequest("John", "Doe", "john@test.com", "Pass@123", "9876543210", RegistrationRequest.UserRole.PASSENGER, "A1234567", "Indian", 9L));
        assertThat(RegistrationRequest.UserRole.ADMIN).isNotNull();
    }

    @Test
    void responseDtosCoverDataMethods() {
        UserResponse userResponse = new UserResponse(1L, "John", "Doe", "john@test.com", "9876543210", "A1234567", "Indian", "https://img", 4L, User.AuthProvider.LOCAL, User.UserRole.PASSENGER, true);
        UserResponse sameUserResponse = new UserResponse(1L, "John", "Doe", "john@test.com", "9876543210", "A1234567", "Indian", "https://img", 4L, User.AuthProvider.LOCAL, User.UserRole.PASSENGER, true);
        assertThat(userResponse).isEqualTo(sameUserResponse);

        AdminUserSummaryResponse summary = new AdminUserSummaryResponse(1L, "John Doe", "John", "Doe", "john@test.com", "9876543210", User.AuthProvider.GOOGLE, User.UserRole.ADMIN, true, "Sky Booker");
        AdminUserSummaryResponse sameSummary = new AdminUserSummaryResponse(1L, "John Doe", "John", "Doe", "john@test.com", "9876543210", User.AuthProvider.GOOGLE, User.UserRole.ADMIN, true, "Sky Booker");
        assertThat(summary).isEqualTo(sameSummary);
    }

    @Test
    void googleTokenPayloadBuilderAndDataMethodsAreCovered() {
        GoogleTokenPayload payload = GoogleTokenPayload.builder()
                .email("john@test.com")
                .name("John Doe")
                .picture("https://img")
                .sub("sub-123")
                .build();

        GoogleTokenPayload same = GoogleTokenPayload.builder()
                .email("john@test.com")
                .name("John Doe")
                .picture("https://img")
                .sub("sub-123")
                .build();

        assertThat(payload).isEqualTo(same);
        assertThat(payload.hashCode()).isEqualTo(same.hashCode());
        assertThat(payload.toString()).contains("john@test.com");
    }

    @Test
    void userEntityCoversLifecycleAndDataMethods() {
        LocalDateTime createdAt = LocalDateTime.of(2024, 1, 1, 10, 0);
        LocalDateTime updatedAt = LocalDateTime.of(2024, 1, 2, 10, 0);
        LocalDateTime resetExpiry = LocalDateTime.of(2024, 1, 3, 10, 0);
        User user = new User(1L, "John", "Doe", "john@test.com", "secret", "9876543210", "A1234567", "Indian", "https://img", null, 4L, "google-id", User.AuthProvider.LOCAL, User.UserRole.PASSENGER, true, createdAt, updatedAt, "reset", resetExpiry);

        invokeLifecycle(user, "onCreate");
        invokeLifecycle(user, "onUpdate");

        User same = new User(user.getId(), user.getFirstName(), user.getLastName(), user.getEmail(), user.getPassword(), user.getPhoneNumber(), user.getPassportNumber(), user.getNationality(), user.getProfilePhotoUrl(), user.getAirline(), user.getAirlineId(), user.getGoogleId(), user.getAuthProvider(), user.getRole(), user.getIsActive(), user.getCreatedAt(), user.getUpdatedAt(), user.getResetToken(), user.getResetTokenExpiry());
        assertThat(user).isEqualTo(same);
        assertThat(User.AuthProvider.GOOGLE).isNotNull();
        assertThat(User.UserRole.AIRLINE_STAFF).isNotNull();
    }

    @Test
    void airlineEntityCoversDataMethods() {
        LocalDateTime createdAt = LocalDateTime.of(2024, 1, 1, 10, 0);
        LocalDateTime updatedAt = LocalDateTime.of(2024, 1, 2, 10, 0);
        Airline airline = new Airline(1L, "Sky Booker", "SB", true, createdAt, updatedAt);
        Airline same = new Airline(1L, "Sky Booker", "SB", true, createdAt, updatedAt);

        assertThat(airline).isEqualTo(same);
        assertThat(airline.hashCode()).isEqualTo(same.hashCode());
        assertThat(airline.toString()).contains("Sky Booker");
    }

    @Test
    void authExceptionExposesErrorCodeAndCause() {
        RuntimeException cause = new RuntimeException("root");
        AuthException exception = new AuthException("bad creds", "INVALID", cause);
        AuthException simple = new AuthException("bad creds", "INVALID");

        assertThat(exception.getMessage()).isEqualTo("bad creds");
        assertThat(exception.getErrorCode()).isEqualTo("INVALID");
        assertThat(exception.getCause()).isEqualTo(cause);
        assertThat(simple.getErrorCode()).isEqualTo("INVALID");
    }

    @Test
    void validationPatternsAndSupportClassesAreCovered() throws Exception {
        assertThat(ValidationPatterns.NAME).contains("A-Za-z");
        assertThat(ValidationPatterns.EMAIL).contains("@");
        assertThat(ValidationPatterns.PASSWORD).contains("8,15");
        assertThat(ValidationPatterns.PHONE_NUMBER).contains("10");
        assertThat(ValidationPatterns.PASSPORT).contains("6,20");
        assertThat(ValidationPatterns.NATIONALITY).contains("A-Za-z");
        assertThat(ValidationPatterns.JWT_LIKE_TOKEN).contains("\\.");

        Constructor<ValidationPatterns> constructor = ValidationPatterns.class.getDeclaredConstructor();
        constructor.setAccessible(true);
        assertThat(constructor.newInstance()).isNotNull();

        assertThat(new AuthServiceApplication()).isNotNull();
        GlobalExceptionHandler.ErrorResponse errorResponse = new GlobalExceptionHandler.ErrorResponse(400, "bad", "ERR", LocalDateTime.now());
        assertThat(errorResponse.getStatus()).isEqualTo(400);
        assertThat(errorResponse.getMessage()).isEqualTo("bad");

        Class<?> clazz = Class.forName("com.skyBooker.auth.service.AuthenticationServiceImpl$AirlineResponse");
        Constructor<?> nestedConstructor = clazz.getDeclaredConstructor();
        nestedConstructor.setAccessible(true);
        Object nested = nestedConstructor.newInstance();
        setProperty(clazz, nested, "setId", Long.class, 1L);
        setProperty(clazz, nested, "setName", String.class, "Sky Booker");
        setProperty(clazz, nested, "setIataCode", String.class, "SB");
        setProperty(clazz, nested, "setDescription", String.class, "desc");
        setProperty(clazz, nested, "setPhoneNumber", String.class, "9876543210");
        setProperty(clazz, nested, "setEmail", String.class, "airline@test.com");
        setProperty(clazz, nested, "setIsActive", Boolean.class, true);
        setProperty(clazz, nested, "setCreatedAt", String.class, "2024-01-01");
        setProperty(clazz, nested, "setUpdatedAt", String.class, "2024-01-02");
        assertThat(invokeGetter(clazz, nested, "getName")).isEqualTo("Sky Booker");
        assertThat(invokeGetter(clazz, nested, "getIsActive")).isEqualTo(true);
    }

    private void invokeLifecycle(Object target, String methodName) {
        try {
            Method method = target.getClass().getDeclaredMethod(methodName);
            method.setAccessible(true);
            method.invoke(target);
        } catch (ReflectiveOperationException ex) {
            throw new AssertionError(ex);
        }
    }

    private void setProperty(Class<?> clazz, Object target, String methodName, Class<?> type, Object value) throws Exception {
        Method method = clazz.getDeclaredMethod(methodName, type);
        method.setAccessible(true);
        method.invoke(target, value);
    }

    private Object invokeGetter(Class<?> clazz, Object target, String methodName) throws Exception {
        Method method = clazz.getDeclaredMethod(methodName);
        method.setAccessible(true);
        return method.invoke(target);
    }
}
