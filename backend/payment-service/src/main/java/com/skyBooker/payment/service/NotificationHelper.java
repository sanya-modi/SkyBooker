package com.skyBooker.payment.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationHelper {

    @Value("${services.notification-base-url:http://notification-service}")
    private String notificationBaseUrl;

    public void sendBookingConfirmation(Long userId, Long bookingId, String email, String phoneNumber, String pnr, String flightNumber) {
        // Send Email
        sendNotification(userId, bookingId, "EMAIL", email, 
            "Booking Confirmed - " + pnr,
            String.format("Your flight booking is confirmed! PNR: %s, Flight: %s. Have a great journey!", pnr, flightNumber));

        // Send SMS
        sendNotification(userId, bookingId, "SMS", phoneNumber,
            "Booking Confirmed",
            String.format("SkyBooker: Your booking is confirmed. PNR: %s, Flight: %s", pnr, flightNumber));

        // Send In-App Notification
        sendNotification(userId, bookingId, "IN_APP", "user-" + userId,
            "Booking Confirmed",
            String.format("Your flight booking %s is confirmed!", pnr));
    }

    private void sendNotification(Long userId, Long bookingId, String channel, String recipient, String subject, String message) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("userId", userId);
            request.put("bookingId", bookingId);
            request.put("type", "BOOKING_CONFIRMATION");
            request.put("channel", channel);
            request.put("subject", subject);
            request.put("message", message);
            request.put("recipient", recipient);

            RestTemplate restTemplate = new RestTemplate();
            restTemplate.postForEntity(
                notificationBaseUrl + "/notifications",
                request,
                Object.class
            );
        } catch (Exception e) {
            // Log error but don't fail the payment flow
            System.err.println("Failed to send notification: " + e.getMessage());
        }
    }
}
