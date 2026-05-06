package com.skyBooker.notification.config;

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
    void handleRuntimeExceptionBuildsExpectedResponse() {
        WebRequest request = mock(WebRequest.class);
        when(request.getDescription(false)).thenReturn("uri=/notifications/1");

        ResponseEntity<?> response = handler.handleRuntimeException(new RuntimeException("boom"), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertThat(body.get("message")).isEqualTo("boom");
        assertThat(body.get("path")).isEqualTo("/notifications/1");
    }

    @Test
    void handleValidationExceptionBuildsExpectedResponse() throws Exception {
        WebRequest request = mock(WebRequest.class);
        when(request.getDescription(false)).thenReturn("uri=/notifications");

        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new DummyBody(), "dummyBody");
        bindingResult.addError(new FieldError("dummyBody", "userId", "User id is required"));
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(
                new MethodParameter(DummyController.class.getMethod("submit", DummyBody.class), 0),
                bindingResult
        );

        ResponseEntity<?> response = handler.handleValidationException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertThat(body.get("error")).isEqualTo("Validation Failed");
        assertThat(((Map<?, ?>) body.get("errors")).get("userId")).isEqualTo("User id is required");
    }

    @Test
    void handleGlobalExceptionBuildsExpectedResponse() {
        WebRequest request = mock(WebRequest.class);
        when(request.getDescription(false)).thenReturn("uri=/notifications/support");

        ResponseEntity<?> response = handler.handleGlobalException(new Exception("bad"), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertThat(body.get("message")).isEqualTo("An unexpected error occurred");
        assertThat(body.get("path")).isEqualTo("/notifications/support");
    }

    static class DummyController {
        public void submit(DummyBody body) {
        }
    }

    static class DummyBody {
    }
}
