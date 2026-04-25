package com.skyBooker.notification.validation;

public final class NotificationValidationPatterns {

    private NotificationValidationPatterns() {
    }

    public static final String SUBJECT = "^[A-Za-z0-9][A-Za-z0-9\\s&()_.,:;!?@#%/+-]{2,199}$";
    public static final String MESSAGE = "^[\\s\\S]{1,2000}$";
    public static final String RECIPIENT = "^(?:[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}|\\+?[1-9]\\d{1,14}|[A-Za-z0-9_\\-]{3,100})$";
}
