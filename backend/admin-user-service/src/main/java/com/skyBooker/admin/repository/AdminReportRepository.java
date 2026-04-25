package com.skyBooker.admin.repository;

import com.skyBooker.admin.entity.AdminReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminReportRepository extends JpaRepository<AdminReport, Long> {

    @Query("SELECT ar FROM AdminReport ar WHERE ar.reportType = :reportType ORDER BY ar.createdAt DESC")
    List<AdminReport> findByReportType(@Param("reportType") AdminReport.ReportType reportType);
}
