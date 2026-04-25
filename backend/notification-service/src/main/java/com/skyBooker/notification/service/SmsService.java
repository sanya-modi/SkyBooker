package com.skyBooker.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SmsService {

    public void sendBookingConfirmation(String phoneNumber, String pnr, String flightNumber, String date) {
        try {
            String message = String.format(
                "SkyBooker: Your booking is confirmed! PNR: %s, Flight: %s, Date: %s. E-ticket sent to your email. Have a great flight!",
                pnr, flightNumber, date
            );
            
            // In production, integrate with SMS gateway (Twilio, AWS SNS, etc.)
            log.info("SMS sent to {}: {}", phoneNumber, message);
            
            // Simulate SMS sending
            simulateSmsGateway(phoneNumber, message);
        } catch (Exception e) {
            log.error("Failed to send SMS to: {}", phoneNumber, e);
        }
    }

    public void sendCheckInReminder(String phoneNumber, String pnr) {
        try {
            String message = String.format(
                "SkyBooker: Web check-in is now open for PNR: %s. Check in now at skybooker.com/checkin",
                pnr
            );
            
            log.info("Check-in reminder SMS sent to {}: {}", phoneNumber, message);
            simulateSmsGateway(phoneNumber, message);
        } catch (Exception e) {
            log.error("Failed to send check-in reminder SMS to: {}", phoneNumber, e);
        }
    }

    private void simulateSmsGateway(String phoneNumber, String message) {
        // Simulate SMS gateway delay
        log.info("📱 SMS Gateway: Sending to {} - {}", phoneNumber, message);
    }
}
