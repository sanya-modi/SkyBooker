package com.skyBooker.airlineairport.config;

import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.context.request.WebRequest;

import com.skyBooker.airlineairport.config.GlobalExceptionHandler;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleRuntimeExceptionBuildsErrorResponse() {
        WebRequest request = mock(WebRequest.class);
        when(request.getDescription(false)).thenReturn("uri=/airlines/1");

        ResponseEntity<Map<String, Object>> response = handler.handleRuntimeException(new RuntimeException("boom"), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        Map<String, Object> body = response.getBody();
        assertThat(body).containsEntry("message", "boom");
        assertThat(body).containsEntry("path", "/airlines/1");
    }

    @Test
    void handleValidationExceptionReturnsFieldErrors() throws NoSuchMethodException {
        WebRequest request = mock(WebRequest.class);
        when(request.getDescription(false)).thenReturn("uri=/airports");

        DummyBody body = new DummyBody();
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(body, "dummyBody");
        bindingResult.addError(new FieldError("dummyBody", "name", "Name is required"));
        bindingResult.addError(new FieldError("dummyBody", "iataCode", "Invalid IATA code"));
        MethodArgumentNotValidException exception = new MethodArgumentNotValidException(
                new MethodParameter(DummyController.class.getMethod("submit", DummyBody.class), 0),
                bindingResult
        );

        ResponseEntity<Map<String, Object>> response = handler.handleValidationException(exception, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        Map<String, Object> bodyMap = response.getBody();
        assertThat(bodyMap).containsEntry("message", "Input validation error");
        @SuppressWarnings("unchecked")
        Map<String, String> errors = (Map<String, String>) bodyMap.get("errors");
        assertThat(errors).containsEntry("name", "Name is required");
        assertThat(errors).containsEntry("iataCode", "Invalid IATA code");
        assertThat(bodyMap).containsEntry("path", "/airports");
    }

    @Test
    void handleGlobalExceptionIncludesExceptionClass() {
        WebRequest request = mock(WebRequest.class);
        when(request.getDescription(false)).thenReturn("uri=/search");

        ResponseEntity<Map<String, Object>> response = handler.handleGlobalException(new IllegalStateException("bad state"), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        Map<String, Object> body = response.getBody();
        assertThat(body).containsEntry("message", "bad state");
        assertThat(body).containsEntry("exception", IllegalStateException.class.getName());
    }

    static class DummyController {
        public void submit(DummyBody body) {
        }
    }

    static class DummyBody {
    }
}
