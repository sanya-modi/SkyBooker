package com.skyBooker.notification.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatCode;

class SmsServiceTest {

    private final SmsService smsService = new SmsService();

    @Test
    void sendBookingConfirmationDoesNotThrow() {
        assertThatCode(() -> smsService.sendBookingConfirmation("9999999999", "PNR123", "SB101", "2026-05-05"))
                .doesNotThrowAnyException();
    }

    @Test
    void sendCheckInReminderDoesNotThrow() {
        assertThatCode(() -> smsService.sendCheckInReminder("9999999999", "PNR123"))
                .doesNotThrowAnyException();
    }
}
