package com.skyBooker.auth.validation;

public final class ValidationPatterns {

    private ValidationPatterns() {
    }

    public static final String NAME = "^[A-Za-z][A-Za-z\\s'-]{1,49}$";
    public static final String EMAIL = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
    public static final String PASSWORD = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,15}$";
    public static final String PHONE_NUMBER = "^(?:[0-9]{10}|\\+?[1-9]\\d{1,14})$";
    public static final String PASSPORT = "^[A-Z0-9]{6,20}$";
    public static final String NATIONALITY = "^[A-Za-z][A-Za-z\\s-]{1,49}$";
    public static final String JWT_LIKE_TOKEN = "^[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+$";
}

