package com.skyBooker.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminNotificationRecipientRequest {
    private Long userId;
    private String email;
}
