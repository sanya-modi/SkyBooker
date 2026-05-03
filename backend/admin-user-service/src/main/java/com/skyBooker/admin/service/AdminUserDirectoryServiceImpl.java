package com.skyBooker.admin.service;

import com.skyBooker.admin.dto.AdminNotificationDispatchRequest;
import com.skyBooker.admin.dto.AdminNotificationRecipientRequest;
import com.skyBooker.admin.dto.AdminNotificationSendRequest;
import com.skyBooker.admin.dto.AdminUserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminUserDirectoryServiceImpl implements AdminUserDirectoryService {

    private final RestTemplate restTemplate;

    @Value("${services.auth.base-url:http://localhost:8081}")
    private String authServiceBaseUrl;

    @Value("${services.notification.base-url:http://localhost:8087}")
    private String notificationServiceBaseUrl;

    @Override
    public List<AdminUserResponse> getAllUsers() {
        AdminUserResponse[] users = restTemplate.getForObject(
                authServiceBaseUrl + "/auth/admin/users/all",
                AdminUserResponse[].class
        );
        return users == null ? List.of() : Arrays.asList(users);
    }

    @Override
    @Transactional
    public void sendNotification(AdminNotificationSendRequest request) {
        List<AdminNotificationRecipientRequest> recipients = getAllUsers().stream()
                .filter(AdminUserResponse::getIsActive)
                .filter(user -> matchesAudience(user, request.getTargetAudience()))
                .map(user -> new AdminNotificationRecipientRequest(user.getId(), user.getEmail()))
                .toList();

        if (recipients.isEmpty()) {
            return;
        }

        AdminNotificationDispatchRequest dispatchRequest = new AdminNotificationDispatchRequest(
                request.getSubject(),
                request.getMessage(),
                request.getType(),
                recipients
        );

        restTemplate.exchange(
                notificationServiceBaseUrl + "/notifications/admin/broadcast/send",
                HttpMethod.POST,
                new HttpEntity<>(dispatchRequest),
                Void.class
        );
    }

    private boolean matchesAudience(AdminUserResponse user, String targetAudience) {
        String normalizedAudience = targetAudience == null ? "ALL" : targetAudience.toUpperCase(Locale.ROOT);
        String userRole = user.getRole() == null ? "" : user.getRole().toUpperCase(Locale.ROOT);
        return "ALL".equals(normalizedAudience) || normalizedAudience.equals(userRole);
    }
}
