package com.skyBooker.admin.service;

import com.skyBooker.admin.dto.CreateAdminReportRequest;
import com.skyBooker.admin.dto.UpdateAdminReportRequest;
import com.skyBooker.admin.entity.AuditLog;
import com.skyBooker.admin.entity.AdminReport;

import java.util.List;
import java.util.Map;

public interface AdminService {
    AdminReport createReport(CreateAdminReportRequest request);
    AdminReport getReportById(Long id);
    List<AdminReport> getAllReports();
    List<AdminReport> getReportsByType(AdminReport.ReportType reportType);
    AdminReport updateReport(Long id, UpdateAdminReportRequest reportData);
    void deleteReport(Long id);
    List<AuditLog> getAuditLogs();
    Map<String, Object> getAnalyticsSummary();
}
