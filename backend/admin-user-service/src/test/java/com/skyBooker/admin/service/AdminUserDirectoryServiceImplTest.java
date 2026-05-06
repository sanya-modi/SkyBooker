package com.skyBooker.admin.service;

import com.skyBooker.admin.dto.AdminNotificationSendRequest;
import com.skyBooker.admin.dto.AdminUserResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminUserDirectoryServiceImplTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private AdminUserDirectoryServiceImpl adminUserDirectoryService;

    @Test
    void getAllUsersReturnsEmptyListWhenNull() {
        ReflectionTestUtils.setField(adminUserDirectoryService, "authServiceBaseUrl", "http://auth");

        when(restTemplate.getForObject(anyString(), eq(AdminUserResponse[].class)))
                .thenReturn(null);

        assertThat(adminUserDirectoryService.getAllUsers()).isEmpty();
    }

    @Test
    void getAllUsersReturnsList() {
        ReflectionTestUtils.setField(adminUserDirectoryService, "authServiceBaseUrl", "http://auth");

        when(restTemplate.getForObject(anyString(), eq(AdminUserResponse[].class)))
                .thenReturn(new AdminUserResponse[]{
                        new AdminUserResponse(1L, "A", "A", "One", "a@test.com", null, "LOCAL", "PASSENGER", true, null)
                });

        List<AdminUserResponse> result = adminUserDirectoryService.getAllUsers();

        assertThat(result).hasSize(1);
    }

    @Test
    void sendNotificationSendsForMatchingAudience() {
        ReflectionTestUtils.setField(adminUserDirectoryService, "authServiceBaseUrl", "http://auth");
        ReflectionTestUtils.setField(adminUserDirectoryService, "notificationServiceBaseUrl", "http://notify");

        when(restTemplate.getForObject(anyString(), eq(AdminUserResponse[].class)))
                .thenReturn(new AdminUserResponse[]{
                        new AdminUserResponse(1L, "A", "A", "One", "a@test.com", null, "LOCAL", "PASSENGER", true, null),
                        new AdminUserResponse(2L, "B", "B", "Two", "b@test.com", null, "LOCAL", "ADMIN", true, null),
                        new AdminUserResponse(3L, "C", "C", "Three", "c@test.com", null, "LOCAL", "PASSENGER", false, null)
                });

        AdminNotificationSendRequest request =
                new AdminNotificationSendRequest("Subject", "Body", "PASSENGER", "TYPE");

        adminUserDirectoryService.sendNotification(request);

        verify(restTemplate).exchange(
                eq("http://notify/notifications/admin/broadcast/send"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Void.class)
        );
    }

    @Test
    void sendNotificationWithAllAudience() {
        ReflectionTestUtils.setField(adminUserDirectoryService, "authServiceBaseUrl", "http://auth");
        ReflectionTestUtils.setField(adminUserDirectoryService, "notificationServiceBaseUrl", "http://notify");

        when(restTemplate.getForObject(anyString(), eq(AdminUserResponse[].class)))
                .thenReturn(new AdminUserResponse[]{
                        new AdminUserResponse(1L, "A", "A", "One", "a@test.com", null, "LOCAL", "PASSENGER", true, null),
                        new AdminUserResponse(2L, "B", "B", "Two", "b@test.com", null, "LOCAL", "ADMIN", true, null)
                });

        AdminNotificationSendRequest request =
                new AdminNotificationSendRequest("Sub", "Msg", null, "TYPE");

        adminUserDirectoryService.sendNotification(request);

        verify(restTemplate).exchange(
                anyString(),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Void.class)
        );
    }

    @Test
    void sendNotificationHandlesNullRole() {
        ReflectionTestUtils.setField(adminUserDirectoryService, "authServiceBaseUrl", "http://auth");
        ReflectionTestUtils.setField(adminUserDirectoryService, "notificationServiceBaseUrl", "http://notify");

        when(restTemplate.getForObject(anyString(), eq(AdminUserResponse[].class)))
                .thenReturn(new AdminUserResponse[]{
                        new AdminUserResponse(1L, "A", "A", "One", "a@test.com", null, "LOCAL", null, true, null)
                });

        AdminNotificationSendRequest request =
                new AdminNotificationSendRequest("Sub", "Msg", "ADMIN", "TYPE");

        adminUserDirectoryService.sendNotification(request);

        verify(restTemplate, never()).exchange(
                anyString(),
                any(HttpMethod.class),
                any(HttpEntity.class),
                eq(Void.class)
        );
    }

    @Test
    void sendNotificationWhenNoUsers() {
        ReflectionTestUtils.setField(adminUserDirectoryService, "authServiceBaseUrl", "http://auth");

        when(restTemplate.getForObject(anyString(), eq(AdminUserResponse[].class)))
                .thenReturn(new AdminUserResponse[]{});

        AdminNotificationSendRequest request =
                new AdminNotificationSendRequest("Sub", "Msg", "ALL", "TYPE");

        adminUserDirectoryService.sendNotification(request);

        verify(restTemplate, never()).exchange(
                anyString(),
                any(HttpMethod.class),
                any(HttpEntity.class),
                eq(Void.class)
        );
    }

    @Test
    void sendNotificationNoMatchingRecipients() {
        ReflectionTestUtils.setField(adminUserDirectoryService, "authServiceBaseUrl", "http://auth");

        when(restTemplate.getForObject(anyString(), eq(AdminUserResponse[].class)))
                .thenReturn(new AdminUserResponse[]{
                        new AdminUserResponse(2L, "B", "B", "Two", "b@test.com", null, "LOCAL", "ADMIN", false, null)
                });

        AdminNotificationSendRequest request =
                new AdminNotificationSendRequest("Sub", "Msg", "PASSENGER", "TYPE");

        adminUserDirectoryService.sendNotification(request);

        verify(restTemplate, never()).exchange(
                anyString(),
                any(HttpMethod.class),
                any(HttpEntity.class),
                eq(Void.class)
        );
    }

    @Test
    void getAllUsersMultiple() {
        ReflectionTestUtils.setField(adminUserDirectoryService, "authServiceBaseUrl", "http://auth");

        AdminUserResponse[] users = new AdminUserResponse[]{
                new AdminUserResponse(1L, "A", "A", "One", "a@test.com", null, "LOCAL", "PASSENGER", true, null),
                new AdminUserResponse(2L, "B", "B", "Two", "b@test.com", null, "LOCAL", "ADMIN", true, null),
                new AdminUserResponse(3L, "C", "C", "Three", "c@test.com", null, "LOCAL", "PASSENGER", true, null)
        };

        when(restTemplate.getForObject(anyString(), eq(AdminUserResponse[].class)))
                .thenReturn(users);

        List<AdminUserResponse> result = adminUserDirectoryService.getAllUsers();

        assertThat(result).hasSize(3);
    }

    @Test
    void sendNotificationWithAdminAudience() {
        ReflectionTestUtils.setField(adminUserDirectoryService, "authServiceBaseUrl", "http://auth");
        ReflectionTestUtils.setField(adminUserDirectoryService, "notificationServiceBaseUrl", "http://notify");

        when(restTemplate.getForObject(anyString(), eq(AdminUserResponse[].class)))
                .thenReturn(new AdminUserResponse[]{
                        new AdminUserResponse(1L, "A", "A", "One", "a@test.com", null, "LOCAL", "ADMIN", true, null),
                        new AdminUserResponse(2L, "B", "B", "Two", "b@test.com", null, "LOCAL", "PASSENGER", true, null)
                });

        AdminNotificationSendRequest request =
                new AdminNotificationSendRequest("Admin Alert", "Important", "ADMIN", "ALERT");

        adminUserDirectoryService.sendNotification(request);

        verify(restTemplate).exchange(
                anyString(),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Void.class)
        );
    }

    @Test
    void sendNotificationInactiveUsers() {
        ReflectionTestUtils.setField(adminUserDirectoryService, "authServiceBaseUrl", "http://auth");
        ReflectionTestUtils.setField(adminUserDirectoryService, "notificationServiceBaseUrl", "http://notify");

        when(restTemplate.getForObject(anyString(), eq(AdminUserResponse[].class)))
                .thenReturn(new AdminUserResponse[]{
                        new AdminUserResponse(1L, "A", "A", "One", "a@test.com", null, "LOCAL", "PASSENGER", false, null),
                        new AdminUserResponse(2L, "B", "B", "Two", "b@test.com", null, "LOCAL", "PASSENGER", false, null)
                });

        AdminNotificationSendRequest request =
                new AdminNotificationSendRequest("Sub", "Msg", "PASSENGER", "TYPE");

        adminUserDirectoryService.sendNotification(request);

        verify(restTemplate, never()).exchange(
                anyString(),
                any(HttpMethod.class),
                any(HttpEntity.class),
                eq(Void.class)
        );
    }

    @Test
    void sendNotificationMixedActiveInactive() {
        ReflectionTestUtils.setField(adminUserDirectoryService, "authServiceBaseUrl", "http://auth");
        ReflectionTestUtils.setField(adminUserDirectoryService, "notificationServiceBaseUrl", "http://notify");

        when(restTemplate.getForObject(anyString(), eq(AdminUserResponse[].class)))
                .thenReturn(new AdminUserResponse[]{
                        new AdminUserResponse(1L, "A", "A", "One", "a@test.com", null, "LOCAL", "PASSENGER", true, null),
                        new AdminUserResponse(2L, "B", "B", "Two", "b@test.com", null, "LOCAL", "PASSENGER", false, null),
                        new AdminUserResponse(3L, "C", "C", "Three", "c@test.com", null, "LOCAL", "PASSENGER", true, null)
                });

        AdminNotificationSendRequest request =
                new AdminNotificationSendRequest("Sub", "Msg", "PASSENGER", "TYPE");

        adminUserDirectoryService.sendNotification(request);

        verify(restTemplate).exchange(
                anyString(),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Void.class)
        );
    }

    @Test
    void getAllUsersCallsCorrectUrl() {
        ReflectionTestUtils.setField(adminUserDirectoryService, "authServiceBaseUrl", "http://auth-service");

        when(restTemplate.getForObject(contains("http://auth-service"), eq(AdminUserResponse[].class)))
                .thenReturn(new AdminUserResponse[]{});

        adminUserDirectoryService.getAllUsers();

        verify(restTemplate).getForObject(contains("http://auth-service"), eq(AdminUserResponse[].class));
    }

    @Test
    void sendNotificationCallsCorrectEndpoint() {
        ReflectionTestUtils.setField(adminUserDirectoryService, "authServiceBaseUrl", "http://auth");
        ReflectionTestUtils.setField(adminUserDirectoryService, "notificationServiceBaseUrl", "http://notify");

        when(restTemplate.getForObject(anyString(), eq(AdminUserResponse[].class)))
                .thenReturn(new AdminUserResponse[]{
                        new AdminUserResponse(1L, "A", "A", "One", "a@test.com", null, "LOCAL", "PASSENGER", true, null)
                });

        AdminNotificationSendRequest request =
                new AdminNotificationSendRequest("Sub", "Msg", "PASSENGER", "TYPE");

        adminUserDirectoryService.sendNotification(request);

        verify(restTemplate).exchange(
                contains("http://notify"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Void.class)
        );
    }
}
