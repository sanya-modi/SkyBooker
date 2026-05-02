package com.skyBooker.auth.controller;

import com.skyBooker.auth.dto.AdminUserSummaryResponse;
import com.skyBooker.auth.service.AdminUserQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/auth/admin/users")
@RequiredArgsConstructor
public class AdminUserQueryController {

    private final AdminUserQueryService adminUserQueryService;

    @GetMapping("/all")
    public ResponseEntity<List<AdminUserSummaryResponse>> getAllUsers() {
        return ResponseEntity.ok(adminUserQueryService.getAllUsers());
    }
}
