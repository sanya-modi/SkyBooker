package com.skyBooker.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skyBooker.admin.dto.CreateAdminReportRequest;
import com.skyBooker.admin.entity.AdminReport;
import com.skyBooker.admin.service.AdminService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminController.class)
class AdminControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private AdminService adminService;
    @Autowired private ObjectMapper objectMapper;

    @Test
    void createReport() throws Exception {
        CreateAdminReportRequest req = new CreateAdminReportRequest(
                "Test","Desc", AdminReport.ReportType.DAILY,
                BigDecimal.TEN,1L,2L,3L
        );

        when(adminService.createReport(any())).thenReturn(new AdminReport());

        mockMvc.perform(post("/admin/reports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());
    }

    @Test
    void getReportById() throws Exception {
        when(adminService.getReportById(1L)).thenReturn(new AdminReport());

        mockMvc.perform(get("/admin/reports/1"))
                .andExpect(status().isOk());
    }

    @Test
    void deleteReport() throws Exception {
        mockMvc.perform(delete("/admin/reports/1"))
                .andExpect(status().isNoContent());

        verify(adminService).deleteReport(1L);
    }

    @Test
    void getAnalytics() throws Exception {
        when(adminService.getAnalyticsSummary()).thenReturn(Map.of());

        mockMvc.perform(get("/admin/analytics"))
                .andExpect(status().isOk());
    }

    @Test
    void getAllReports() throws Exception {
        when(adminService.getAllReports()).thenReturn(List.of(new AdminReport()));

        mockMvc.perform(get("/admin/reports"))
                .andExpect(status().isOk());
    }

    @Test
    void getReportsByType() throws Exception {
        when(adminService.getReportsByType(AdminReport.ReportType.DAILY)).thenReturn(List.of(new AdminReport()));

        mockMvc.perform(get("/admin/reports/type/DAILY"))
                .andExpect(status().isOk());
    }

    @Test
    void updateReport() throws Exception {
        com.skyBooker.admin.dto.UpdateAdminReportRequest req = new com.skyBooker.admin.dto.UpdateAdminReportRequest();
        req.setReportName("Updated Test");
        req.setDescription("Updated Desc");

        when(adminService.updateReport(eq(1L), any())).thenReturn(new AdminReport());

        mockMvc.perform(put("/admin/reports/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    @Test
    void getDashboardInfo() throws Exception {
        mockMvc.perform(get("/admin/dashboard"))
                .andExpect(status().isOk())
                .andExpect(content().string("SkyBooker Admin Dashboard"));
    }

    @Test
    void getAuditLogs() throws Exception {
        when(adminService.getAuditLogs()).thenReturn(List.of());

        mockMvc.perform(get("/admin/audit-logs"))
                .andExpect(status().isOk());
    }

    @Test
    void getReportByIdNotFound() throws Exception {
        when(adminService.getReportById(999L)).thenThrow(new RuntimeException("Report not found"));

        mockMvc.perform(get("/admin/reports/999"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getAllReportsEmpty() throws Exception {
        when(adminService.getAllReports()).thenReturn(List.of());

        mockMvc.perform(get("/admin/reports"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    void getReportsByTypeEmpty() throws Exception {
        when(adminService.getReportsByType(AdminReport.ReportType.MONTHLY)).thenReturn(List.of());

        mockMvc.perform(get("/admin/reports/type/MONTHLY"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    void createReportWithAllFields() throws Exception {
        CreateAdminReportRequest req = new CreateAdminReportRequest(
                "Monthly Report", "Monthly analysis", AdminReport.ReportType.MONTHLY,
                new BigDecimal("10000"), 500L, 250L, 1000L
        );

        AdminReport saved = new AdminReport();
        saved.setId(1L);
        saved.setReportName("Monthly Report");

        when(adminService.createReport(any())).thenReturn(saved);

        mockMvc.perform(post("/admin/reports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        verify(adminService).createReport(any());
    }

    @Test
    void updateReportPartial() throws Exception {
        com.skyBooker.admin.dto.UpdateAdminReportRequest req = new com.skyBooker.admin.dto.UpdateAdminReportRequest();
        req.setReportName("Updated");

        AdminReport updated = new AdminReport();
        updated.setId(1L);
        updated.setReportName("Updated");

        when(adminService.updateReport(eq(1L), any())).thenReturn(updated);

        mockMvc.perform(put("/admin/reports/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    @Test
    void deleteReportVerifiesCall() throws Exception {
        mockMvc.perform(delete("/admin/reports/5"))
                .andExpect(status().isNoContent());

        verify(adminService, times(1)).deleteReport(5L);
    }

    @Test
    void getAnalyticsReturnsData() throws Exception {
        Map<String, Object> analytics = Map.of(
                "reportCount", 10,
                "totalRevenue", new BigDecimal("50000"),
                "totalBookings", 500L
        );

        when(adminService.getAnalyticsSummary()).thenReturn(analytics);

        mockMvc.perform(get("/admin/analytics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reportCount").value(10));
    }

    @Test
    void getAuditLogsMultiple() throws Exception {
        when(adminService.getAuditLogs()).thenReturn(List.of(
                new com.skyBooker.admin.entity.AuditLog(),
                new com.skyBooker.admin.entity.AuditLog()
        ));

        mockMvc.perform(get("/admin/audit-logs"))
                .andExpect(status().isOk());
    }
}
