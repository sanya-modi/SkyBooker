package com.skyBooker.payment.config;

import com.razorpay.RazorpayClient;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RazorpayProvider {

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    private RazorpayClient client;

    public RazorpayClient getClient() {
        if (client == null) {
            try {
                client = new RazorpayClient(keyId, keySecret);
            } catch (Exception e) {
                throw new RuntimeException("Failed to initialize Razorpay client: " + e.getMessage());
            }
        }
        return client;
    }
}
