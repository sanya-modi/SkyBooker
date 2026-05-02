package com.skyBooker.admin.service;

import com.skyBooker.admin.dto.AdminUserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminUserDirectoryServiceImpl implements AdminUserDirectoryService {

    private final RestTemplate restTemplate;

    @Value("${services.auth.base-url:http://localhost:8081}")
    private String authServiceBaseUrl;

    @Override
    public List<AdminUserResponse> getAllUsers() {
        AdminUserResponse[] users = restTemplate.getForObject(
                authServiceBaseUrl + "/auth/admin/users/all",
                AdminUserResponse[].class
        );
        return users == null ? List.of() : Arrays.asList(users);
    }
}
