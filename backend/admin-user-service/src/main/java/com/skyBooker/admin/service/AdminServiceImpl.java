package com.skyBooker.admin.service;

import com.skyBooker.admin.dto.CreateAdminReportRequest;
import com.skyBooker.admin.dto.UpdateAdminReportRequest;
import com.skyBooker.admin.entity.AuditLog;
import com.skyBooker.admin.entity.AdminReport;
import com.skyBooker.admin.repository.AdminReportRepository;
import com.skyBooker.admin.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminServiceImpl implements AdminService {

    private final AdminReportRepository adminReportRepository;
    private final AuditLogRepository auditLogRepository;

    @Override
    public AdminReport createReport(CreateAdminReportRequest request) {
        AdminReport report = new AdminReport();
        report.setReportName(request.getReportName());
        report.setDescription(request.getDescription());
        report.setReportType(request.getReportType());
        report.setTotalRevenue(request.getTotalRevenue());
        report.setTotalBookings(request.getTotalBookings());
        report.setTotalFlights(request.getTotalFlights());
        report.setActiveUsers(request.getActiveUsers());

        AdminReport saved = adminReportRepository.save(report);
        auditLogRepository.save(buildAuditLog("SYSTEM", "CREATE_REPORT", "AdminReport", saved.getId(), "Created report " + saved.getReportName()));
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminReport getReportById(Long id) {
        return adminReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminReport> getAllReports() {
        return adminReportRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminReport> getReportsByType(AdminReport.ReportType reportType) {
        return adminReportRepository.findByReportType(reportType);
    }

    @Override
    public AdminReport updateReport(Long id, UpdateAdminReportRequest reportData) {
        AdminReport report = getReportById(id);
        if (reportData.getReportName() != null) {
            report.setReportName(reportData.getReportName());
        }
        if (reportData.getDescription() != null) {
            report.setDescription(reportData.getDescription());
        }
        if (reportData.getTotalRevenue() != null) {
            report.setTotalRevenue(reportData.getTotalRevenue());
        }
        if (reportData.getTotalBookings() != null) {
            report.setTotalBookings(reportData.getTotalBookings());
        }
        if (reportData.getTotalFlights() != null) {
            report.setTotalFlights(reportData.getTotalFlights());
        }
        if (reportData.getActiveUsers() != null) {
            report.setActiveUsers(reportData.getActiveUsers());
        }
        AdminReport saved = adminReportRepository.save(report);
        auditLogRepository.save(buildAuditLog("SYSTEM", "UPDATE_REPORT", "AdminReport", saved.getId(), "Updated report " + saved.getReportName()));
        return saved;
    }

    @Override
    public void deleteReport(Long id) {
        auditLogRepository.save(buildAuditLog("SYSTEM", "DELETE_REPORT", "AdminReport", id, "Deleted report " + id));
        adminReportRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAnalyticsSummary() {
        List<AdminReport> reports = adminReportRepository.findAll();
        BigDecimal totalRevenue = reports.stream()
                .map(AdminReport::getTotalRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalBookings = reports.stream().mapToLong(AdminReport::getTotalBookings).sum();
        long totalFlights = reports.stream().mapToLong(AdminReport::getTotalFlights).sum();
        long activeUsers = reports.stream().mapToLong(AdminReport::getActiveUsers).sum();

        return Map.of(
                "reportCount", reports.size(),
                "totalRevenue", totalRevenue,
                "totalBookings", totalBookings,
                "totalFlights", totalFlights,
                "activeUsers", activeUsers
        );
    }

    private AuditLog buildAuditLog(String actor, String action, String targetType, Long targetId, String details) {
        return new AuditLog(null, actor, action, targetType, targetId == null ? null : String.valueOf(targetId), details, null);
    }
}
