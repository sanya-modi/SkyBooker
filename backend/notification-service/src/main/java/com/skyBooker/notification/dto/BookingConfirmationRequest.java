package com.skyBooker.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingConfirmationRequest {
    private String email;
    private String phoneNumber;
    private String pnr;
    private Map<String, Object> bookingDetails;
    private byte[] ticketPdf;
}
