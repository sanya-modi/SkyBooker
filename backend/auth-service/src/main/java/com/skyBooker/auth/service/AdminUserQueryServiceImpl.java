package com.skyBooker.auth.service;

import com.skyBooker.auth.dto.AdminUserSummaryResponse;
import com.skyBooker.auth.entity.User;
import com.skyBooker.auth.repository.AdminUserQueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminUserQueryServiceImpl implements AdminUserQueryService {

    private final AdminUserQueryRepository adminUserQueryRepository;

    @Override
    public List<AdminUserSummaryResponse> getAllUsers() {
        return adminUserQueryRepository.findAllByOrderByIdDesc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    private AdminUserSummaryResponse mapToResponse(User user) {
        return new AdminUserSummaryResponse(
                user.getId(),
                buildName(user),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getAuthProvider(),
                user.getRole(),
                user.getIsActive(),
                null
        );
    }

    private String buildName(User user) {
        String firstName = user.getFirstName() == null ? "" : user.getFirstName().trim();
        String lastName = user.getLastName() == null ? "" : user.getLastName().trim();
        return (firstName + " " + lastName).trim();
    }
}
