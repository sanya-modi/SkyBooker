package com.skyBooker.admin.service;

import com.skyBooker.admin.dto.AdminUserResponse;
import com.skyBooker.admin.dto.AdminNotificationSendRequest;

import java.util.List;

public interface AdminUserDirectoryService {
    List<AdminUserResponse> getAllUsers();
    void sendNotification(AdminNotificationSendRequest request);
}
