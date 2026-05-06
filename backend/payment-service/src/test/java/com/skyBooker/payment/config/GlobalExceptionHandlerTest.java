package com.skyBooker.payment.config;

import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.context.request.ServletWebRequest;

import java.lang.reflect.Method;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleRuntimeExceptionReturnsInternalServerErrorPayload() {
        ResponseEntity<?> response = handler.handleRuntimeException(
                new RuntimeException("Payment not found"),
                request("/payments/1")
        );

        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertThat(response.getStatusCode().value()).isEqualTo(500);
        assertThat(body.get("message")).isEqualTo("Payment not found");
        assertThat(body.get("path")).isEqualTo("/payments/1");
    }

    @Test
    void handleValidationExceptionReturnsFieldErrors() throws Exception {
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "refundRequest");
        bindingResult.addError(new FieldError("refundRequest", "refundAmount", "Refund amount is required"));

        ResponseEntity<?> response = handler.handleValidationException(
                new MethodArgumentNotValidException(methodParameter(), bindingResult),
                request("/payments/1/refund")
        );

        Map<?, ?> body = (Map<?, ?>) response.getBody();
        Map<?, ?> errors = (Map<?, ?>) body.get("errors");
        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(errors.get("refundAmount")).isEqualTo("Refund amount is required");
    }

    @Test
    void handleIllegalArgumentExceptionReturnsBadRequestPayload() {
        ResponseEntity<?> response = handler.handleIllegalArgumentException(
                new IllegalArgumentException("Invalid payment status"),
                request("/payments/status/bad")
        );

        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(body.get("error")).isEqualTo("Bad Request");
    }

    @Test
    void handleGlobalExceptionReturnsGenericMessage() {
        ResponseEntity<?> response = handler.handleGlobalException(
                new Exception("boom"),
                request("/payments")
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
