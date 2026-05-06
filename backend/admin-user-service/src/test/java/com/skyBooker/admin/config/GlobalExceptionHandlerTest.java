package com.skyBooker.admin.config;

import org.junit.jupiter.api.Test;
import org.springframework.web.context.request.WebRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void runtimeException() {
        WebRequest request = mock(WebRequest.class);
        when(request.getDescription(false)).thenReturn("uri=/test");

        var res = handler.handleRuntimeException(new RuntimeException("Error"), request);

        assertThat(res.getStatusCode().value()).isEqualTo(500);
    }

    @Test
    void validationException() {
        WebRequest request = mock(WebRequest.class);
        when(request.getDescription(false)).thenReturn("uri=/test");

        org.springframework.validation.BindingResult bindingResult = mock(org.springframework.validation.BindingResult.class);
        org.springframework.validation.FieldError fieldError = new org.springframework.validation.FieldError("obj", "field", "message");
        when(bindingResult.getFieldErrors()).thenReturn(java.util.List.of(fieldError));
        org.springframework.web.bind.MethodArgumentNotValidException ex = mock(org.springframework.web.bind.MethodArgumentNotValidException.class);
        when(ex.getBindingResult()).thenReturn(bindingResult);

        var res = handler.handleValidationException(ex, request);

        assertThat(res.getStatusCode().value()).isEqualTo(400);
    }

    @Test
    void constraintViolationException() {
        WebRequest request = mock(WebRequest.class);
        when(request.getDescription(false)).thenReturn("uri=/test");

        jakarta.validation.ConstraintViolation<?> violation = mock(jakarta.validation.ConstraintViolation.class);
        jakarta.validation.Path path = mock(jakarta.validation.Path.class);
        when(path.toString()).thenReturn("path");
        when(violation.getPropertyPath()).thenReturn(path);
        when(violation.getMessage()).thenReturn("message");

        jakarta.validation.ConstraintViolationException ex = new jakarta.validation.ConstraintViolationException(java.util.Set.of(violation));

        var res = handler.handleConstraintViolationException(ex, request);

        assertThat(res.getStatusCode().value()).isEqualTo(400);
    }

    @Test
    void constraintViolationExceptionEmpty() {
        WebRequest request = mock(WebRequest.class);
        when(request.getDescription(false)).thenReturn("uri=/test");

        jakarta.validation.ConstraintViolationException ex = new jakarta.validation.ConstraintViolationException(java.util.Set.of());

        var res = handler.handleConstraintViolationException(ex, request);

        assertThat(res.getStatusCode().value()).isEqualTo(400);
    }

    @Test
    void methodArgumentTypeMismatchException() {
        WebRequest request = mock(WebRequest.class);
        when(request.getDescription(false)).thenReturn("uri=/test");

        org.springframework.web.method.annotation.MethodArgumentTypeMismatchException ex = mock(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class);
        when(ex.getName()).thenReturn("param");

        var res = handler.handleMethodArgumentTypeMismatchException(ex, request);

        assertThat(res.getStatusCode().value()).isEqualTo(400);
    }

    @Test
    void globalException() {
        WebRequest request = mock(WebRequest.class);
        when(request.getDescription(false)).thenReturn("uri=/test");

        var res = handler.handleGlobalException(new Exception("Error"), request);

        assertThat(res.getStatusCode().value()).isEqualTo(500);
    }

    @Test
    void runtimeExceptionWithMessage() {
        WebRequest request = mock(WebRequest.class);
        when(request.getDescription(false)).thenReturn("uri=/admin/reports");

        var res = handler.handleRuntimeException(new RuntimeException("Report not found"), request);

        assertThat(res.getStatusCode().value()).isEqualTo(500);
        assertThat(res.getBody()).isNotNull();
    }

    @Test
    void validationExceptionMultipleErrors() {
        WebRequest request = mock(WebRequest.class);
        when(request.getDescription(false)).thenReturn("uri=/test");

        org.springframework.validation.BindingResult bindingResult = mock(org.springframework.validation.BindingResult.class);
        org.springframework.validation.FieldError error1 = new org.springframework.validation.FieldError("obj", "field1", "error1");
        org.springframework.validation.FieldError error2 = new org.springframework.validation.FieldError("obj", "field2", "error2");
        when(bindingResult.getFieldErrors()).thenReturn(java.util.List.of(error1, error2));
        org.springframework.web.bind.MethodArgumentNotValidException ex = mock(org.springframework.web.bind.MethodArgumentNotValidException.class);
        when(ex.getBindingResult()).thenReturn(bindingResult);

        var res = handler.handleValidationException(ex, request);

        assertThat(res.getStatusCode().value()).isEqualTo(400);
    }

    @Test
    void constraintViolationExceptionMultiple() {
        WebRequest request = mock(WebRequest.class);
        when(request.getDescription(false)).thenReturn("uri=/test");

        jakarta.validation.ConstraintViolation<?> violation1 = mock(jakarta.validation.ConstraintViolation.class);
        jakarta.validation.Path path1 = mock(jakarta.validation.Path.class);
        when(path1.toString()).thenReturn("field1");
        when(violation1.getPropertyPath()).thenReturn(path1);
        when(violation1.getMessage()).thenReturn("must not be null");

        jakarta.validation.ConstraintViolation<?> violation2 = mock(jakarta.validation.ConstraintViolation.class);
        jakarta.validation.Path path2 = mock(jakarta.validation.Path.class);
        when(path2.toString()).thenReturn("field2");
        when(violation2.getPropertyPath()).thenReturn(path2);
        when(violation2.getMessage()).thenReturn("must be positive");

        jakarta.validation.ConstraintViolationException ex = new jakarta.validation.ConstraintViolationException(java.util.Set.of(violation1, violation2));

        var res = handler.handleConstraintViolationException(ex, request);

        assertThat(res.getStatusCode().value()).isEqualTo(400);
    }

    @Test
    void methodArgumentTypeMismatchExceptionDetails() {
        WebRequest request = mock(WebRequest.class);
        when(request.getDescription(false)).thenReturn("uri=/admin/reports/abc");

        org.springframework.web.method.annotation.MethodArgumentTypeMismatchException ex = mock(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class);
        when(ex.getName()).thenReturn("id");
        when(ex.getValue()).thenReturn("abc");

        var res = handler.handleMethodArgumentTypeMismatchException(ex, request);

        assertThat(res.getStatusCode().value()).isEqualTo(400);
    }

    @Test
    void globalExceptionWithCause() {
        WebRequest request = mock(WebRequest.class);
        when(request.getDescription(false)).thenReturn("uri=/test");

        Exception cause = new Exception("Root cause");
        Exception ex = new Exception("Wrapper exception", cause);

        var res = handler.handleGlobalException(ex, request);

        assertThat(res.getStatusCode().value()).isEqualTo(500);
    }

    @Test
    void runtimeExceptionResponseBody() {
        WebRequest request = mock(WebRequest.class);
        when(request.getDescription(false)).thenReturn("uri=/admin/reports");

        var res = handler.handleRuntimeException(new RuntimeException("Test error"), request);

        assertThat(res.getBody()).isNotNull();
        assertThat(res.getStatusCode().value()).isEqualTo(500);
    }

    @Test
    void validationExceptionResponseBody() {
        WebRequest request = mock(WebRequest.class);
        when(request.getDescription(false)).thenReturn("uri=/admin/reports");

        org.springframework.validation.BindingResult bindingResult = mock(org.springframework.validation.BindingResult.class);
        org.springframework.validation.FieldError fieldError = new org.springframework.validation.FieldError("obj", "field", "error");
        when(bindingResult.getFieldErrors()).thenReturn(java.util.List.of(fieldError));
        org.springframework.web.bind.MethodArgumentNotValidException ex = mock(org.springframework.web.bind.MethodArgumentNotValidException.class);
        when(ex.getBindingResult()).thenReturn(bindingResult);

        var res = handler.handleValidationException(ex, request);

        assertThat(res.getBody()).isNotNull();
        assertThat(res.getStatusCode().value()).isEqualTo(400);
    }
}
