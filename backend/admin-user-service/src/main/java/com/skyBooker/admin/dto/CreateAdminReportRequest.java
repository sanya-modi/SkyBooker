package com.skyBooker.admin.dto;

import com.skyBooker.admin.entity.AdminReport;
import com.skyBooker.admin.validation.AdminValidationPatterns;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAdminReportRequest {

    @NotBlank(message = "Report name is required")
    @Pattern(regexp = AdminValidationPatterns.REPORT_NAME, message = "Report name contains invalid characters or length")
    private String reportName;

    @Pattern(regexp = AdminValidationPatterns.DESCRIPTION, message = "Description contains invalid characters")
    private String description;

    @NotNull(message = "Report type is required")
    private AdminReport.ReportType reportType;

    @NotNull(message = "Total revenue is required")
    @DecimalMin(value = "0.00", inclusive = true, message = "Total revenue must be zero or positive")
    private BigDecimal totalRevenue;

    @NotNull(message = "Total bookings is required")
    @PositiveOrZero(message = "Total bookings must be zero or positive")
    private Long totalBookings;

    @NotNull(message = "Total flights is required")
    @PositiveOrZero(message = "Total flights must be zero or positive")
    private Long totalFlights;

    @NotNull(message = "Active users is required")
    @PositiveOrZero(message = "Active users must be zero or positive")
    private Long activeUsers;
}

