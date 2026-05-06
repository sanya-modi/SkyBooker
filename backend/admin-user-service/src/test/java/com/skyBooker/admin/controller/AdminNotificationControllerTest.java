package com.skyBooker.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skyBooker.admin.dto.AdminNotificationSendRequest;
import com.skyBooker.admin.service.AdminUserDirectoryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminNotificationController.class)
class AdminNotificationControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private AdminUserDirectoryService service;
    @Autowired private ObjectMapper objectMapper;

    @Test
    void sendNotification() throws Exception {
        AdminNotificationSendRequest req =
                new AdminNotificationSendRequest(
                        "Test Notification",
                        "Flight delay update for passengers",
                        "PASSENGER",
                        "FLIGHT_UPDATE"
                );

        mockMvc.perform(post("/admin/notifications/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        verify(service).sendNotification(req);
    }

    @Test
    void sendNotificationToAllAudience() throws Exception {
        AdminNotificationSendRequest req =
                new AdminNotificationSendRequest(
                        "System Maintenance",
                        "System will be down for maintenance",
                        "ALL",
                        "FLIGHT_UPDATE"
                );

        mockMvc.perform(post("/admin/notifications/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        verify(service).sendNotification(any());
    }

    @Test
    void sendNotificationToAdminRole() throws Exception {
        AdminNotificationSendRequest req =
                new AdminNotificationSendRequest(
                        "Admin Alert",
                        "New admin task available",
                        "ADMIN",
                        "FLIGHT_UPDATE"
                );

        mockMvc.perform(post("/admin/notifications/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        verify(service).sendNotification(req);
    }

    @Test
    void sendNotificationCallsService() throws Exception {
        AdminNotificationSendRequest req =
                new AdminNotificationSendRequest(
                        "Subject",
                        "Body",
                        "PASSENGER",
                        "BOOKING_CONFIRMATION"
                );

        mockMvc.perform(post("/admin/notifications/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        verify(service).sendNotification(any(AdminNotificationSendRequest.class));
    }

    @Test
    void sendNotificationWithDifferentTypes() throws Exception {
        AdminNotificationSendRequest req =
                new AdminNotificationSendRequest(
                        "Booking Confirmation",
                        "Your booking has been confirmed",
                        "PASSENGER",
                        "BOOKING_CONFIRMATION"
                );

        mockMvc.perform(post("/admin/notifications/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        verify(service).sendNotification(any());
    }

    @Test
    void sendNotificationResponseOk() throws Exception {
        AdminNotificationSendRequest req =
                new AdminNotificationSendRequest(
                        "Test",
                        "Test Body",
                        "PASSENGER",
                        "PAYMENT_SUCCESS"
                );

        mockMvc.perform(post("/admin/notifications/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    @Test
    void sendNotificationWithEmptyAudience() throws Exception {
        AdminNotificationSendRequest req =
                new AdminNotificationSendRequest(
                        "Broadcast",
                        "Message to all",
                        "ALL",
                        "FLIGHT_UPDATE"
                );

        mockMvc.perform(post("/admin/notifications/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        verify(service).sendNotification(any());
    }

    @Test
    void sendNotificationContentType() throws Exception {
        AdminNotificationSendRequest req =
                new AdminNotificationSendRequest(
                        "Subject",
                        "Body",
                        "PASSENGER",
                        "CHECK_IN_REMINDER"
                );

        mockMvc.perform(post("/admin/notifications/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }
}
