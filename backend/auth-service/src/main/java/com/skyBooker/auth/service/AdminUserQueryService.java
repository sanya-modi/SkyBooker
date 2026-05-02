package com.skyBooker.auth.service;

import com.skyBooker.auth.dto.AdminUserSummaryResponse;

import java.util.List;

public interface AdminUserQueryService {
    List<AdminUserSummaryResponse> getAllUsers();
}
