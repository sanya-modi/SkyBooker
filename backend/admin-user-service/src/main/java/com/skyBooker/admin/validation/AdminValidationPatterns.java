package com.skyBooker.admin.validation;

public final class AdminValidationPatterns {

    private AdminValidationPatterns() {
    }

    public static final String REPORT_NAME = "^[A-Za-z0-9][A-Za-z0-9\\s&()_.,-]{2,99}$";
    public static final String DESCRIPTION = "^[A-Za-z0-9\\s&()_.,:;!?@#%/+-]{0,500}$";
}

