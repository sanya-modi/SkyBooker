package com.skyBooker.flight.exception;

public class FlightException extends RuntimeException {

    private final String errorCode;

    public FlightException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
