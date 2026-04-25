package com.skyBooker.passenger.validation;

public final class PassengerValidationPatterns {

    private PassengerValidationPatterns() {
    }

    public static final String NAME = "^[A-Za-z][A-Za-z\\s'-]{1,49}$";
    public static final String PASSPORT = "^[A-Z0-9]{6,20}$";
    public static final String NATIONALITY = "^[A-Za-z][A-Za-z\\s-]{1,49}$";
    public static final String SPECIAL_REQUESTS = "^[A-Za-z0-9\\s,./()_+-]{0,255}$";
}
