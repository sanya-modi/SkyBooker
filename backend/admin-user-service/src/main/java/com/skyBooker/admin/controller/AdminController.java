package com.skyBooker.admin.controller;

import com.skyBooker.admin.dto.CreateAdminReportRequest;
import com.skyBooker.admin.dto.AdminReportResponse;
import com.skyBooker.admin.dto.UpdateAdminReportRequest;
import com.skyBooker.admin.entity.AuditLog;
import com.skyBooker.admin.entity.AdminReport;
import com.skyBooker.admin.service.AdminService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Validated
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/reports")
    public ResponseEntity<AdminReportResponse> createReport(@Valid @RequestBody CreateAdminReportRequest request) {
        AdminReport report = adminService.createReport(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(report));
    }

    @GetMapping("/reports/{id}")
    public ResponseEntity<AdminReportResponse> getReportById(@PathVariable @Positive(message = "id must be positive") Long id) {
        return ResponseEntity.ok(mapToResponse(adminService.getReportById(id)));
    }

    @GetMapping("/reports")
    public ResponseEntity<List<AdminReportResponse>> getAllReports() {
        return ResponseEntity.ok(adminService.getAllReports().stream().map(this::mapToResponse).collect(Collectors.toList()));
    }

    @GetMapping("/reports/type/{reportType}")
    public ResponseEntity<List<AdminReportResponse>> getReportsByType(@PathVariable AdminReport.ReportType reportType) {
        return ResponseEntity.ok(adminService.getReportsByType(reportType).stream().map(this::mapToResponse).collect(Collectors.toList()));
    }

    @PutMapping("/reports/{id}")
    public ResponseEntity<AdminReportResponse> updateReport(
            @PathVariable @Positive(message = "id must be positive") Long id,
            @Valid @RequestBody UpdateAdminReportRequest report
    ) {
        return ResponseEntity.ok(mapToResponse(adminService.updateReport(id, report)));
    }

    @DeleteMapping("/reports/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable @Positive(message = "id must be positive") Long id) {
        adminService.deleteReport(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<String> getDashboardInfo() {
        return ResponseEntity.ok("SkyBooker Admin Dashboard");
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        return ResponseEntity.ok(adminService.getAnalyticsSummary());
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(adminService.getAuditLogs());
    }

    private AdminReportResponse mapToResponse(AdminReport report) {
        return new AdminReportResponse(
                report.getId(),
                report.getReportName(),
                report.getDescription(),
                report.getReportType(),
                report.getTotalRevenue(),
                report.getTotalBookings(),
                report.getTotalFlights(),
                report.getActiveUsers(),
                report.getCreatedAt(),
                report.getUpdatedAt()
        );
    }
}
