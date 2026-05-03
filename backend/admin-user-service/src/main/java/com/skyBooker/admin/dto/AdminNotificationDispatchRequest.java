package com.skyBooker.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminNotificationDispatchRequest {
    private String subject;
    private String message;
    private String type;
    private List<AdminNotificationRecipientRequest> recipients;
}
