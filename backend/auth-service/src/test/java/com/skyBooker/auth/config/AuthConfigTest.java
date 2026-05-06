package com.skyBooker.auth.config;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.skyBooker.auth.dto.GoogleTokenPayload;
import com.skyBooker.auth.exception.AuthException;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestTemplate;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthConfigTest {

    @Test
    void rabbitMqConfigCreatesConverterAndTemplate() {
        RabbitMQConfig config = new RabbitMQConfig();
        ConnectionFactory connectionFactory = mock(ConnectionFactory.class);

        Jackson2JsonMessageConverter converter = config.messageConverter();
        RabbitTemplate template = config.rabbitTemplate(connectionFactory);

        assertThat(converter).isNotNull();
        assertThat(template.getMessageConverter()).isInstanceOf(Jackson2JsonMessageConverter.class);
    }

    @Test
    void securityConfigCreatesPasswordEncoderAndRestTemplate() {
        SecurityConfig config = new SecurityConfig();

        PasswordEncoder passwordEncoder = config.passwordEncoder();
        RestTemplate restTemplate = config.restTemplate();

        assertThat(passwordEncoder.matches("Pass@123", passwordEncoder.encode("Pass@123"))).isTrue();
        assertThat(restTemplate).isNotNull();
    }

    @Test
    void jwtProviderGeneratesTokenWithConfiguredClaims() throws Exception {
        JwtProvider jwtProvider = new JwtProvider();
        setField(jwtProvider, "jwtSecret", "skyBookerSecretKeyForJWTTokenValidationPurpose123456789");
        setField(jwtProvider, "jwtExpirationInMs", 60000L);

        String token = jwtProvider.generateToken("john@test.com", "PASSENGER");

        String[] parts = token.split("\\.");
        assertThat(parts).hasSize(3);
        assertThat(token).contains(".");
    }

    @Test
    void googleOAuthProviderReturnsEmailWhenTokenIsValid() throws Exception {
        GoogleOAuthProvider provider = new GoogleOAuthProvider();
        GoogleIdTokenVerifier verifier = mock(GoogleIdTokenVerifier.class);
        GoogleIdToken idToken = mock(GoogleIdToken.class);
        GoogleIdToken.Payload payload = mock(GoogleIdToken.Payload.class);
        when(verifier.verify("token")).thenReturn(idToken);
        when(idToken.getPayload()).thenReturn(payload);
        when(payload.get("email")).thenReturn("john@test.com");
        setField(provider, "verifier", verifier);

        assertThat(provider.verifyGoogleToken("token")).isEqualTo("john@test.com");
    }

    @Test
    void googleOAuthProviderReturnsNullWhenVerifierReturnsNull() throws Exception {
        GoogleOAuthProvider provider = new GoogleOAuthProvider();
        GoogleIdTokenVerifier verifier = mock(GoogleIdTokenVerifier.class);
        when(verifier.verify("token")).thenReturn(null);
        setField(provider, "verifier", verifier);

        assertThat(provider.verifyGoogleToken("token")).isNull();
        assertThat(provider.getTokenPayload("token")).isNull();
    }

    @Test
    void googleOAuthProviderBuildsPayloadWhenTokenIsValid() throws Exception {
        GoogleOAuthProvider provider = new GoogleOAuthProvider();
        GoogleIdTokenVerifier verifier = mock(GoogleIdTokenVerifier.class);
        GoogleIdToken idToken = mock(GoogleIdToken.class);
        GoogleIdToken.Payload payload = mock(GoogleIdToken.Payload.class);
        when(verifier.verify("token")).thenReturn(idToken);
        when(idToken.getPayload()).thenReturn(payload);
        when(payload.get("email")).thenReturn("john@test.com");
        when(payload.get("name")).thenReturn("John Doe");
        when(payload.get("picture")).thenReturn("https://img");
        when(payload.get("sub")).thenReturn("google-sub");
        setField(provider, "verifier", verifier);

        GoogleTokenPayload tokenPayload = provider.getTokenPayload("token");

        assertThat(tokenPayload.getEmail()).isEqualTo("john@test.com");
        assertThat(tokenPayload.getName()).isEqualTo("John Doe");
        assertThat(tokenPayload.getPicture()).isEqualTo("https://img");
        assertThat(tokenPayload.getSub()).isEqualTo("google-sub");
    }

    @Test
    void googleOAuthProviderWrapsVerifierErrors() throws Exception {
        GoogleOAuthProvider provider = new GoogleOAuthProvider();
        GoogleIdTokenVerifier verifier = mock(GoogleIdTokenVerifier.class);
        when(verifier.verify("token")).thenThrow(new IllegalStateException("bad token"));
        setField(provider, "verifier", verifier);

        assertThatThrownBy(() -> provider.verifyGoogleToken("token"))
                .isInstanceOf(AuthException.class)
                .hasMessageContaining("Invalid Google token")
                .extracting("errorCode")
                .isEqualTo("INVALID_GOOGLE_TOKEN");
    }

    @Test
    void globalExceptionHandlerBuildsExpectedResponses() throws Exception {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();

        GlobalExceptionHandler.ErrorResponse authError = handler.handleAuthException(new AuthException("bad credentials", "INVALID_CREDENTIALS")).getBody();
        assertThat(authError.getStatus()).isEqualTo(401);
        assertThat(authError.getErrorCode()).isEqualTo("INVALID_CREDENTIALS");

        jakarta.validation.ConstraintViolation<?> violation = mock(jakarta.validation.ConstraintViolation.class);
        jakarta.validation.Path path = mock(jakarta.validation.Path.class);
        when(path.toString()).thenReturn("login.email");
        when(violation.getPropertyPath()).thenReturn(path);
        when(violation.getMessage()).thenReturn("must be valid");
        jakarta.validation.ConstraintViolationException validationEx = new jakarta.validation.ConstraintViolationException(Set.of(violation));
        GlobalExceptionHandler.ErrorResponse validationError = handler.handleConstraintViolationException(validationEx).getBody();
        assertThat(validationError.getStatus()).isEqualTo(400);
        assertThat(validationError.getMessage()).contains("login.email: must be valid");

        GlobalExceptionHandler.ErrorResponse globalError = handler.handleGlobalException(new IllegalStateException("boom")).getBody();
        assertThat(globalError.getStatus()).isEqualTo(500);
        assertThat(globalError.getErrorCode()).isEqualTo("INTERNAL_ERROR");
        assertThat(globalError.getTimestamp()).isBeforeOrEqualTo(LocalDateTime.now());
    }

    private void setField(Object target, String name, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(name);
        field.setAccessible(true);
        field.set(target, value);
    }
}
