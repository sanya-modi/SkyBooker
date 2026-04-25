package com.skyBooker.airlineairport.validation;

public final class AirlineAirportValidationPatterns {

    private AirlineAirportValidationPatterns() {
    }

    public static final String NAME = "^[A-Za-z0-9][A-Za-z0-9\\s&()'.,-]{1,99}$";
    public static final String IATA_CODE_AIRLINE = "^[A-Z0-9]{2,3}$";
    public static final String IATA_CODE_AIRPORT = "^[A-Z]{3}$";
    public static final String CITY_COUNTRY = "^[A-Za-z][A-Za-z\\s-]{1,49}$";
    public static final String EMAIL = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
    public static final String PHONE = "^(?:[0-9]{10}|\\+?[1-9]\\d{1,14})$";
    public static final String DESCRIPTION = "^[A-Za-z0-9\\s&()_.,:;!?@#%/+-]{0,500}$";
}
