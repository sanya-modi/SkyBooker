package com.skyBooker.admin.controller;

import com.skyBooker.admin.dto.AdminUserResponse;
import com.skyBooker.admin.service.AdminUserDirectoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserDirectoryService adminUserDirectoryService;

    @GetMapping("/all")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminUserDirectoryService.getAllUsers());
    }
}
