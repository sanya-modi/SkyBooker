package com.skyBooker.admin.dto;

import com.skyBooker.admin.entity.AdminReport;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminReportResponse {
    private Long id;
    private String reportName;
    private String description;
    private AdminReport.ReportType reportType;
    private BigDecimal totalRevenue;
    private Long totalBookings;
    private Long totalFlights;
    private Long activeUsers;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
