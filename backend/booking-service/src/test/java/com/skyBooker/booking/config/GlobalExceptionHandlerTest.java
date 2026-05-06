package com.skyBooker.booking.config;

import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.context.request.WebRequest;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleRuntimeExceptionBuildsInternalServerErrorResponse() {
        WebRequest request = mock(WebRequest.class);
        when(request.getDescription(false)).thenReturn("uri=/bookings/1");

        ResponseEntity<?> response = handler.handleRuntimeException(new RuntimeException("boom"), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertThat(body.get("message")).isEqualTo("boom");
        assertThat(body.get("path")).isEqualTo("/bookings/1");
    }

    @Test
    void handleValidationExceptionBuildsBadRequestResponse() throws Exception {
        WebRequest request = mock(WebRequest.class);
        when(request.getDescription(false)).thenReturn("uri=/bookings");

        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new DummyBody(), "dummyBody");
        bindingResult.addError(new FieldError("dummyBody", "userId", "User ID is required"));
        MethodArgumentNotValidException exception = new MethodArgumentNotValidException(
                new MethodParameter(DummyController.class.getMethod("submit", DummyBody.class), 0),
                bindingResult
        );

        ResponseEntity<?> response = handler.handleValidationException(exception, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertThat(body.get("error")).isEqualTo("Validation Failed");
        assertThat(body.get("message")).isEqualTo("Input validation error");
        assertThat(((Map<?, ?>) body.get("errors")).get("userId")).isEqualTo("User ID is required");
    }

    @Test
    void handleIllegalArgumentExceptionBuildsBadRequestResponse() {
        WebRequest request = mock(WebRequest.class);
        when(request.getDescription(false)).thenReturn("uri=/tickets/pnr/PNR123");

        ResponseEntity<?> response = handler.handleIllegalArgumentException(new IllegalArgumentException("Invalid PNR"), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertThat(body.get("error")).isEqualTo("Bad Request");
        assertThat(body.get("message")).isEqualTo("Invalid PNR");
    }

    @Test
    void handleGlobalExceptionBuildsInternalServerErrorResponse() {
        WebRequest request = mock(WebRequest.class);
        when(request.getDescription(false)).thenReturn("uri=/tickets");

        ResponseEntity<?> response = handler.handleGlobalException(new Exception("broken"), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertThat(body.get("message")).isEqualTo("An unexpected error occurred");
        assertThat(body.get("path")).isEqualTo("/tickets");
    }

    static class DummyController {
        public void submit(DummyBody body) {
        }
    }

    static class DummyBody {
    }
}
