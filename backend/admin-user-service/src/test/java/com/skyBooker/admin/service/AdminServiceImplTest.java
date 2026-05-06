package com.skyBooker.admin.service;

import com.skyBooker.admin.dto.CreateAdminReportRequest;
import com.skyBooker.admin.dto.UpdateAdminReportRequest;
import com.skyBooker.admin.entity.AdminReport;
import com.skyBooker.admin.repository.AdminReportRepository;
import com.skyBooker.admin.repository.AuditLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceImplTest {

    @Mock
    private AdminReportRepository adminReportRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AdminServiceImpl adminService;

    @Test
    void createReport() {
        CreateAdminReportRequest request = new CreateAdminReportRequest(
                "Daily", "desc", AdminReport.ReportType.DAILY,
                BigDecimal.TEN, 2L, 3L, 4L
        );

        AdminReport saved = new AdminReport();
        saved.setId(9L);
        saved.setReportName("Daily");

        when(adminReportRepository.save(any())).thenReturn(saved);

        AdminReport result = adminService.createReport(request);

        assertThat(result.getId()).isEqualTo(9L);
        verify(auditLogRepository).save(any());
    }

    @Test
    void getReportByIdSuccess() {
        AdminReport report = new AdminReport();
        report.setId(1L);

        when(adminReportRepository.findById(1L)).thenReturn(Optional.of(report));

        assertThat(adminService.getReportById(1L)).isNotNull();
    }

    @Test
    void getReportByIdThrows() {
        when(adminReportRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminService.getReportById(1L))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void getAllReports() {
        when(adminReportRepository.findAll()).thenReturn(List.of(new AdminReport()));

        assertThat(adminService.getAllReports()).hasSize(1);
    }

    @Test
    void getReportsByType() {
        when(adminReportRepository.findByReportType(AdminReport.ReportType.DAILY))
                .thenReturn(List.of(new AdminReport()));

        assertThat(adminService.getReportsByType(AdminReport.ReportType.DAILY)).hasSize(1);
    }

    @Test
    void updateReportPartial() {
        AdminReport existing = new AdminReport();
        existing.setId(1L);
        existing.setReportName("Old");

        when(adminReportRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(adminReportRepository.save(any())).thenReturn(existing);

        UpdateAdminReportRequest req = new UpdateAdminReportRequest();
        req.setReportName("New");

        AdminReport result = adminService.updateReport(1L, req);

        assertThat(result.getReportName()).isEqualTo("New");
        verify(auditLogRepository).save(any());
    }

    @Test
    void updateReportNoChanges() {
        AdminReport existing = new AdminReport();
        existing.setId(1L);
        existing.setReportName("Same");

        when(adminReportRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(adminReportRepository.save(any())).thenReturn(existing);

        UpdateAdminReportRequest req = new UpdateAdminReportRequest();

        AdminReport result = adminService.updateReport(1L, req);

        assertThat(result.getReportName()).isEqualTo("Same");
    }

    @Test
    void deleteReport() {
        adminService.deleteReport(12L);

        verify(auditLogRepository).save(any());
        verify(adminReportRepository).deleteById(12L);
    }

    @Test
    void getAuditLogs() {
        when(auditLogRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of());

        assertThat(adminService.getAuditLogs()).isEmpty();
    }

    @Test
    void analyticsSummary() {
        AdminReport r1 = new AdminReport();
        r1.setTotalRevenue(new BigDecimal("100"));
        r1.setTotalBookings(2L);
        r1.setTotalFlights(3L);
        r1.setActiveUsers(4L);

        AdminReport r2 = new AdminReport();
        r2.setTotalRevenue(new BigDecimal("50"));
        r2.setTotalBookings(1L);
        r2.setTotalFlights(2L);
        r2.setActiveUsers(3L);

        when(adminReportRepository.findAll()).thenReturn(List.of(r1, r2));

        Map<String, Object> result = adminService.getAnalyticsSummary();

        assertThat(result).containsEntry("reportCount", 2)
                .containsEntry("totalRevenue", new BigDecimal("150"))
                .containsEntry("totalBookings", 3L)
                .containsEntry("totalFlights", 5L)
                .containsEntry("activeUsers", 7L);
    }

    @Test
    void analyticsSummaryEmpty() {
        when(adminReportRepository.findAll()).thenReturn(List.of());

        Map<String, Object> result = adminService.getAnalyticsSummary();

        assertThat(result).containsEntry("reportCount", 0)
                .containsEntry("totalRevenue", BigDecimal.ZERO)
                .containsEntry("totalBookings", 0L)
                .containsEntry("totalFlights", 0L)
                .containsEntry("activeUsers", 0L);
    }

    @Test
    void updateReportAllFields() {
        AdminReport existing = new AdminReport();
        existing.setId(1L);

        when(adminReportRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(adminReportRepository.save(any())).thenReturn(existing);

        UpdateAdminReportRequest req = new UpdateAdminReportRequest();
        req.setReportName("Name");
        req.setDescription("Desc");
        req.setTotalRevenue(BigDecimal.ONE);
        req.setTotalBookings(1L);
        req.setTotalFlights(1L);
        req.setActiveUsers(1L);

        adminService.updateReport(1L, req);

        verify(adminReportRepository).save(any());
        verify(auditLogRepository).save(any());
    }

    @Test
    void testAuditLogWithNullTargetId() {
        AdminReport existing = new AdminReport();
        existing.setId(null);

        when(adminReportRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(adminReportRepository.save(any())).thenReturn(existing);

        UpdateAdminReportRequest req = new UpdateAdminReportRequest();
        req.setReportName("Name");

        adminService.updateReport(1L, req);

        verify(auditLogRepository).save(argThat(log -> log.getTargetId() == null));
    }

    @Test
    void createReportAuditLogDetails() {
        CreateAdminReportRequest request = new CreateAdminReportRequest(
                "Test", "desc", AdminReport.ReportType.WEEKLY,
                BigDecimal.ZERO, 0L, 0L, 0L
        );

        AdminReport saved = new AdminReport();
        saved.setId(5L);
        saved.setReportName("Test");

        when(adminReportRepository.save(any())).thenReturn(saved);

        adminService.createReport(request);

        verify(auditLogRepository).save(argThat(log -> 
            log.getAction().equals("CREATE_REPORT") &&
            log.getTargetType().equals("AdminReport") &&
            log.getTargetId().equals("5")
        ));
    }

    @Test
    void deleteReportAuditLog() {
        adminService.deleteReport(99L);

        verify(auditLogRepository).save(argThat(log -> 
            log.getAction().equals("DELETE_REPORT") &&
            log.getTargetId().equals("99")
        ));
        verify(adminReportRepository).deleteById(99L);
    }

    @Test
    void updateReportMultipleFields() {
        AdminReport existing = new AdminReport();
        existing.setId(1L);
        existing.setReportName("Old");
        existing.setDescription("Old Desc");
        existing.setTotalRevenue(BigDecimal.ONE);

        when(adminReportRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(adminReportRepository.save(any())).thenReturn(existing);

        UpdateAdminReportRequest req = new UpdateAdminReportRequest();
        req.setReportName("New");
        req.setDescription("New Desc");
        req.setTotalRevenue(BigDecimal.TEN);

        AdminReport result = adminService.updateReport(1L, req);

        assertThat(result.getReportName()).isEqualTo("New");
        assertThat(result.getDescription()).isEqualTo("New Desc");
        assertThat(result.getTotalRevenue()).isEqualTo(BigDecimal.TEN);
    }

    @Test
    void getReportByIdNotFound() {
        when(adminReportRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminService.getReportById(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Report not found");
    }

    @Test
    void getAllReportsEmpty() {
        when(adminReportRepository.findAll()).thenReturn(List.of());

        assertThat(adminService.getAllReports()).isEmpty();
    }

    @Test
    void getReportsByTypeEmpty() {
        when(adminReportRepository.findByReportType(AdminReport.ReportType.MONTHLY))
                .thenReturn(List.of());

        assertThat(adminService.getReportsByType(AdminReport.ReportType.MONTHLY)).isEmpty();
    }

    @Test
    void getAuditLogsMultiple() {
        com.skyBooker.admin.entity.AuditLog log1 = new com.skyBooker.admin.entity.AuditLog();
        com.skyBooker.admin.entity.AuditLog log2 = new com.skyBooker.admin.entity.AuditLog();

        when(auditLogRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(log1, log2));

        assertThat(adminService.getAuditLogs()).hasSize(2);
    }

    @Test
    void updateReportPreservesUnchangedFields() {
        AdminReport existing = new AdminReport();
        existing.setId(1L);
        existing.setReportName("Original");
        existing.setDescription("Original Desc");
        existing.setTotalBookings(10L);

        when(adminReportRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(adminReportRepository.save(any())).thenReturn(existing);

        UpdateAdminReportRequest req = new UpdateAdminReportRequest();
        req.setReportName("Updated");

        adminService.updateReport(1L, req);

        assertThat(existing.getDescription()).isEqualTo("Original Desc");
        assertThat(existing.getTotalBookings()).isEqualTo(10L);
    }

    @Test
    void createReportMapsAllFields() {
        CreateAdminReportRequest request = new CreateAdminReportRequest(
                "Weekly Report", "Weekly analysis", AdminReport.ReportType.WEEKLY,
                new BigDecimal("5000"), 100L, 50L, 200L
        );

        AdminReport saved = new AdminReport();
        saved.setId(10L);
        saved.setReportName("Weekly Report");
        saved.setDescription("Weekly analysis");
        saved.setReportType(AdminReport.ReportType.WEEKLY);
        saved.setTotalRevenue(new BigDecimal("5000"));
        saved.setTotalBookings(100L);
        saved.setTotalFlights(50L);
        saved.setActiveUsers(200L);

        when(adminReportRepository.save(any())).thenReturn(saved);

        AdminReport result = adminService.createReport(request);

        assertThat(result.getReportName()).isEqualTo("Weekly Report");
        assertThat(result.getDescription()).isEqualTo("Weekly analysis");
        assertThat(result.getReportType()).isEqualTo(AdminReport.ReportType.WEEKLY);
        assertThat(result.getTotalRevenue()).isEqualTo(new BigDecimal("5000"));
        assertThat(result.getTotalBookings()).isEqualTo(100L);
        assertThat(result.getTotalFlights()).isEqualTo(50L);
        assertThat(result.getActiveUsers()).isEqualTo(200L);
    }

    @Test
    void updateReportOnlyBookings() {
        AdminReport existing = new AdminReport();
        existing.setId(1L);
        existing.setTotalBookings(5L);

        when(adminReportRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(adminReportRepository.save(any())).thenReturn(existing);

        UpdateAdminReportRequest req = new UpdateAdminReportRequest();
        req.setTotalBookings(15L);

        adminService.updateReport(1L, req);

        assertThat(existing.getTotalBookings()).isEqualTo(15L);
    }

    @Test
    void analyticsSummaryWithMultipleReports() {
        AdminReport r1 = new AdminReport();
        r1.setTotalRevenue(new BigDecimal("200"));
        r1.setTotalBookings(5L);
        r1.setTotalFlights(10L);
        r1.setActiveUsers(50L);

        AdminReport r2 = new AdminReport();
        r2.setTotalRevenue(new BigDecimal("300"));
        r2.setTotalBookings(8L);
        r2.setTotalFlights(15L);
        r2.setActiveUsers(75L);

        AdminReport r3 = new AdminReport();
        r3.setTotalRevenue(new BigDecimal("100"));
        r3.setTotalBookings(2L);
        r3.setTotalFlights(5L);
        r3.setActiveUsers(25L);

        when(adminReportRepository.findAll()).thenReturn(List.of(r1, r2, r3));

        Map<String, Object> result = adminService.getAnalyticsSummary();

        assertThat(result).containsEntry("reportCount", 3)
                .containsEntry("totalRevenue", new BigDecimal("600"))
                .containsEntry("totalBookings", 15L)
                .containsEntry("totalFlights", 30L)
                .containsEntry("activeUsers", 150L);
    }
}
