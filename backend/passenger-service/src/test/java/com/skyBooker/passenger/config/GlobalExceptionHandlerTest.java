package com.skyBooker.passenger.config;

import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.mock.web.MockHttpServletRequest;

import java.lang.reflect.Method;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleRuntimeExceptionReturnsInternalServerErrorPayload() {
        ResponseEntity<?> response = handler.handleRuntimeException(
                new RuntimeException("Passenger not found"),
                request("/passengers/1")
        );

        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertThat(response.getStatusCode().value()).isEqualTo(500);
        assertThat(body.get("error")).isEqualTo("Internal Server Error");
        assertThat(body.get("message")).isEqualTo("Passenger not found");
        assertThat(body.get("path")).isEqualTo("/passengers/1");
    }

    @Test
    void handleValidationExceptionReturnsFieldErrors() throws Exception {
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "passengerRequest");
        bindingResult.addError(new FieldError("passengerRequest", "firstName", "First name is required"));

        ResponseEntity<?> response = handler.handleValidationException(
                new MethodArgumentNotValidException(methodParameter(), bindingResult),
                request("/passengers")
        );

        Map<?, ?> body = (Map<?, ?>) response.getBody();
        Map<?, ?> errors = (Map<?, ?>) body.get("errors");
        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(body.get("error")).isEqualTo("Validation Failed");
        assertThat(errors.get("firstName")).isEqualTo("First name is required");
    }

    @Test
    void handleIllegalArgumentExceptionReturnsBadRequestPayload() {
        ResponseEntity<?> response = handler.handleIllegalArgumentException(
                new IllegalArgumentException("Invalid passenger category"),
                request("/passengers")
        );

        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(body.get("error")).isEqualTo("Bad Request");
        assertThat(body.get("message")).isEqualTo("Invalid passenger category");
    }

    @Test
    void handleGlobalExceptionReturnsGenericMessage() {
        ResponseEntity<?> response = handler.handleGlobalException(
                new Exception("boom"),
                request("/passengers")
        );

        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertThat(response.getStatusCode().value()).isEqualTo(500);
        assertThat(body.get("message")).isEqualTo("An unexpected error occurred");
    }

    private ServletWebRequest request(String uri) {
        return new ServletWebRequest(new MockHttpServletRequest("GET", uri));
    }

    private MethodParameter methodParameter() throws NoSuchMethodException {
        Method method = TestController.class.getDeclaredMethod("payload", Object.class);
        return new MethodParameter(method, 0);
    }

    private static class TestController {
        @SuppressWarnings("unused")
        public void payload(Object payload) {
        }
    }
}
