package com.skyBooker.admin.service;

import com.skyBooker.admin.dto.AdminUserResponse;

import java.util.List;

public interface AdminUserDirectoryService {
    List<AdminUserResponse> getAllUsers();
}
