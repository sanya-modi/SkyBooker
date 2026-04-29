package com.skyBooker.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingEvent {
    private String email;
    private String pnr;
    private Map<String, Object> bookingDetails;
    private byte[] ticketPdf;
}
