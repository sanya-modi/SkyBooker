package com.skyBooker.seat.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.context.request.WebRequest;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@DisplayName("Global Exception Handler Tests")
class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    // ================= RUNTIME EXCEPTION =================

    @Nested
    @DisplayName("Runtime Exception Handling")
    class RuntimeExceptionTests {

        @Test
        void handleRuntimeException() {
            WebRequest request = mock(WebRequest.class);
            when(request.getDescription(false)).thenReturn("uri=/test");

            ResponseEntity<?> response =
                    handler.handleRuntimeException(new RuntimeException("Error"), request);

            assertThat(response.getStatusCode().value()).isEqualTo(500);
            assertThat(response.getBody()).isInstanceOf(Map.class);

            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertThat(body).containsKeys("timestamp", "status", "error", "message", "path");
            assertThat(body.get("status")).isEqualTo(500);
            assertThat(body.get("error")).isEqualTo("Internal Server Error");
            assertThat(body.get("message")).isEqualTo("Error");
        }

        @Test
        void handleRuntimeExceptionWithEmptyMessage() {
            WebRequest request = mock(WebRequest.class);
            when(request.getDescription(false)).thenReturn("uri=/test");

            ResponseEntity<?> response =
                    handler.handleRuntimeException(new RuntimeException(""), request);

            assertThat(response.getStatusCode().value()).isEqualTo(500);
        }

        @Test
        void handleRuntimeExceptionWithLongMessage() {
            WebRequest request = mock(WebRequest.class);
            when(request.getDescription(false)).thenReturn("uri=/test");
            String longMessage = "This is a very long error message that contains detailed information about the error that occurred";

            ResponseEntity<?> response =
                    handler.handleRuntimeException(new RuntimeException(longMessage), request);

            assertThat(response.getStatusCode().value()).isEqualTo(500);

            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertThat(body.get("message")).isEqualTo(longMessage);
        }
    }

    // ================= VALIDATION EXCEPTION =================

    @Nested
    @DisplayName("Method Argument Not Valid Exception Handling")
    class ValidationExceptionTests {

        @Test
        void handleValidationException() {
            BindingResult bindingResult = mock(BindingResult.class);
            when(bindingResult.getFieldErrors()).thenReturn(java.util.List.of());

            MethodArgumentNotValidException ex = new MethodArgumentNotValidException(
                    null, bindingResult
            );

            WebRequest request = mock(WebRequest.class);
            when(request.getDescription(false)).thenReturn("uri=/test");

            ResponseEntity<?> response = handler.handleValidationException(ex, request);

            assertThat(response.getStatusCode().value()).isEqualTo(400);

            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertThat(body).containsKeys("timestamp", "status", "error", "message", "errors", "path");
            assertThat(body.get("status")).isEqualTo(400);
            assertThat(body.get("error")).isEqualTo("Validation Failed");
        }

        @Test
        void handleValidationExceptionWithFieldErrors() {
            org.springframework.validation.FieldError fieldError = mock(org.springframework.validation.FieldError.class);
            when(fieldError.getField()).thenReturn("flightId");
            when(fieldError.getDefaultMessage()).thenReturn("Flight ID must not be null");

            BindingResult bindingResult = mock(BindingResult.class);
            when(bindingResult.getFieldErrors()).thenReturn(java.util.List.of(fieldError));

            MethodArgumentNotValidException ex = new MethodArgumentNotValidException(
                    null, bindingResult
            );

            WebRequest request = mock(WebRequest.class);
            when(request.getDescription(false)).thenReturn("uri=/test");

            ResponseEntity<?> response = handler.handleValidationException(ex, request);

            assertThat(response.getStatusCode().value()).isEqualTo(400);

            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            @SuppressWarnings("unchecked")
            Map<String, String> errors = (Map<String, String>) body.get("errors");
            assertThat(errors).containsEntry("flightId", "Flight ID must not be null");
        }

        @Test
        void handleValidationExceptionWithMultipleFieldErrors() {
            org.springframework.validation.FieldError fieldError1 = mock(org.springframework.validation.FieldError.class);
            when(fieldError1.getField()).thenReturn("flightId");
            when(fieldError1.getDefaultMessage()).thenReturn("Flight ID must not be null");

            org.springframework.validation.FieldError fieldError2 = mock(org.springframework.validation.FieldError.class);
            when(fieldError2.getField()).thenReturn("totalSeats");
            when(fieldError2.getDefaultMessage()).thenReturn("Total seats must be greater than 0");

            BindingResult bindingResult = mock(BindingResult.class);
            when(bindingResult.getFieldErrors()).thenReturn(java.util.List.of(fieldError1, fieldError2));

            MethodArgumentNotValidException ex = new MethodArgumentNotValidException(
                    null, bindingResult
            );

            WebRequest request = mock(WebRequest.class);
            when(request.getDescription(false)).thenReturn("uri=/test");

            ResponseEntity<?> response = handler.handleValidationException(ex, request);

            assertThat(response.getStatusCode().value()).isEqualTo(400);

            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            @SuppressWarnings("unchecked")
            Map<String, String> errors = (Map<String, String>) body.get("errors");
            assertThat(errors)
                    .containsEntry("flightId", "Flight ID must not be null")
                    .containsEntry("totalSeats", "Total seats must be greater than 0");
        }
    }

    // ================= GLOBAL EXCEPTION =================

    @Nested
    @DisplayName("Global Exception Handling")
    class GlobalExceptionTests {

        @Test
        void handleGlobalException() {
            WebRequest request = mock(WebRequest.class);
            when(request.getDescription(false)).thenReturn("uri=/test");

            ResponseEntity<?> response =
                    handler.handleGlobalException(new Exception(), request);

            assertThat(response.getStatusCode().value()).isEqualTo(500);

            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertThat(body).containsKeys("timestamp", "status", "error", "message", "path");
            assertThat(body.get("status")).isEqualTo(500);
            assertThat(body.get("error")).isEqualTo("Internal Server Error");
            assertThat(body.get("message")).isEqualTo("An unexpected error occurred");
        }

        @Test
        void handleGlobalExceptionWithMessage() {
            WebRequest request = mock(WebRequest.class);
            when(request.getDescription(false)).thenReturn("uri=/test");

            ResponseEntity<?> response =
                    handler.handleGlobalException(new Exception("Custom error"), request);

            assertThat(response.getStatusCode().value()).isEqualTo(500);

            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertThat(body.get("message")).isEqualTo("An unexpected error occurred");
        }

        @Test
        void handleNullPointerException() {
            WebRequest request = mock(WebRequest.class);
            when(request.getDescription(false)).thenReturn("uri=/test");

            ResponseEntity<?> response =
                    handler.handleGlobalException(new NullPointerException("Null value"), request);

            assertThat(response.getStatusCode().value()).isEqualTo(500);

            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertThat(body.get("error")).isEqualTo("Internal Server Error");
        }
    }

    // ================= PATH EXTRACTION =================

    @Nested
    @DisplayName("Path Extraction")
    class PathExtractionTests {

        @Test
        void extractPathFromRequest() {
            WebRequest request = mock(WebRequest.class);
            when(request.getDescription(false)).thenReturn("uri=/api/seats/1");

            ResponseEntity<?> response =
                    handler.handleGlobalException(new Exception(), request);

            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertThat(body.get("path")).isEqualTo("/api/seats/1");
        }

        @Test
        void extractPathWithQueryParameters() {
            WebRequest request = mock(WebRequest.class);
            when(request.getDescription(false)).thenReturn("uri=/api/seats/1?flightId=123");

            ResponseEntity<?> response =
                    handler.handleGlobalException(new Exception(), request);

            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertThat(body.get("path")).isEqualTo("/api/seats/1?flightId=123");
        }
    }
}