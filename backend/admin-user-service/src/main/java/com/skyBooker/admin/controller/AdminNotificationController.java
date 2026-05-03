package com.skyBooker.admin.controller;

import com.skyBooker.admin.dto.AdminNotificationSendRequest;
import com.skyBooker.admin.service.AdminUserDirectoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/notifications")
@RequiredArgsConstructor
public class AdminNotificationController {

    private final AdminUserDirectoryService adminUserDirectoryService;

    @PostMapping("/send")
    public ResponseEntity<Void> sendNotification(@Valid @RequestBody AdminNotificationSendRequest request) {
        adminUserDirectoryService.sendNotification(request);
        return ResponseEntity.ok().build();
    }
}
