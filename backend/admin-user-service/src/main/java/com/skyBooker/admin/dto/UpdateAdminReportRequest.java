package com.skyBooker.admin.dto;

import com.skyBooker.admin.validation.AdminValidationPatterns;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAdminReportRequest {

    @Pattern(regexp = AdminValidationPatterns.REPORT_NAME, message = "Report name contains invalid characters or length")
    private String reportName;

    @Pattern(regexp = AdminValidationPatterns.DESCRIPTION, message = "Description contains invalid characters")
    private String description;

    @DecimalMin(value = "0.00", inclusive = true, message = "Total revenue must be zero or positive")
    private BigDecimal totalRevenue;

    @PositiveOrZero(message = "Total bookings must be zero or positive")
    private Long totalBookings;

    @PositiveOrZero(message = "Total flights must be zero or positive")
    private Long totalFlights;

    @PositiveOrZero(message = "Active users must be zero or positive")
    private Long activeUsers;
}

