package com.skyBooker.admin.dto;

import com.skyBooker.admin.entity.AdminReport;
import com.skyBooker.admin.entity.AuditLog;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class DtoEntityCoverageTest {

    @Test
    void testCreateAdminReportRequest() {
        CreateAdminReportRequest req = new CreateAdminReportRequest();
        req.setReportName("Name");
        req.setDescription("Desc");
        req.setReportType(AdminReport.ReportType.DAILY);
        req.setTotalRevenue(BigDecimal.ONE);
        req.setTotalBookings(1L);
        req.setTotalFlights(2L);
        req.setActiveUsers(3L);

        assertEquals("Name", req.getReportName());
        assertEquals("Desc", req.getDescription());
        assertEquals(AdminReport.ReportType.DAILY, req.getReportType());
        assertEquals(BigDecimal.ONE, req.getTotalRevenue());
        assertEquals(1L, req.getTotalBookings());
        assertEquals(2L, req.getTotalFlights());
        assertEquals(3L, req.getActiveUsers());

        CreateAdminReportRequest req2 = new CreateAdminReportRequest("Name", "Desc", AdminReport.ReportType.DAILY, BigDecimal.ONE, 1L, 2L, 3L);
        assertEquals(req, req2);
        assertEquals(req.hashCode(), req2.hashCode());
        assertNotNull(req.toString());
    }

    @Test
    void testAdminNotificationDispatchRequest() {
        AdminNotificationDispatchRequest req = new AdminNotificationDispatchRequest();
        req.setSubject("Sub");
        req.setMessage("Msg");
        req.setType("Role");
        req.setRecipients(java.util.List.of());

        assertEquals("Sub", req.getSubject());
        assertEquals("Msg", req.getMessage());
        assertEquals("Role", req.getType());
        assertEquals(java.util.List.of(), req.getRecipients());

        AdminNotificationDispatchRequest req2 = new AdminNotificationDispatchRequest("Sub", "Msg", "Role", java.util.List.of());
        assertEquals(req, req2);
        assertEquals(req.hashCode(), req2.hashCode());
        assertNotNull(req.toString());
    }

    @Test
    void testAdminNotificationRecipientRequest() {
        AdminNotificationRecipientRequest req = new AdminNotificationRecipientRequest();
        req.setEmail("email");
        req.setUserId(1L);

        assertEquals("email", req.getEmail());
        assertEquals(1L, req.getUserId());

        AdminNotificationRecipientRequest req2 = new AdminNotificationRecipientRequest(1L, "email");
        assertEquals(req, req2);
        assertEquals(req.hashCode(), req2.hashCode());
        assertNotNull(req.toString());
    }

    @Test
    void testAdminNotificationSendRequest() {
        AdminNotificationSendRequest req = new AdminNotificationSendRequest();
        req.setSubject("Sub");
        req.setMessage("Msg");
        req.setTargetAudience("Cri");
        req.setType("Pri");
        
        assertEquals("Sub", req.getSubject());
        assertEquals("Msg", req.getMessage());
        assertEquals("Cri", req.getTargetAudience());
        assertEquals("Pri", req.getType());

        AdminNotificationSendRequest req2 = new AdminNotificationSendRequest();
        req2.setSubject("Sub");
        req2.setMessage("Msg");
        req2.setTargetAudience("Cri");
        req2.setType("Pri");
        assertEquals(req, req2);
        assertEquals(req.hashCode(), req2.hashCode());
        assertNotNull(req.toString());
    }

    @Test
    void testAdminReportResponse() {
        AdminReportResponse res = new AdminReportResponse();
        res.setId(1L);
        res.setReportName("Name");
        res.setDescription("Desc");
        res.setReportType(AdminReport.ReportType.MONTHLY);
        res.setTotalRevenue(BigDecimal.TEN);
        res.setTotalBookings(1L);
        res.setTotalFlights(2L);
        res.setActiveUsers(3L);
        res.setCreatedAt(LocalDateTime.now());
        res.setUpdatedAt(LocalDateTime.now());

        assertEquals(1L, res.getId());
        assertEquals("Name", res.getReportName());
        
        AdminReportResponse res2 = new AdminReportResponse(res.getId(), res.getReportName(), res.getDescription(), res.getReportType(), res.getTotalRevenue(), res.getTotalBookings(), res.getTotalFlights(), res.getActiveUsers(), res.getCreatedAt(), res.getUpdatedAt());
        assertEquals(res, res2);
        assertEquals(res.hashCode(), res2.hashCode());
        assertNotNull(res.toString());
    }

    @Test
    void testAdminUserResponse() {
        AdminUserResponse res = new AdminUserResponse();
        res.setId(1L);
        res.setName("Name");
        res.setFirstName("F");
        res.setLastName("L");
        res.setEmail("E");
        res.setPhoneNumber("P");
        res.setAuthProvider("A");
        res.setRole("R");
        res.setIsActive(true);
        res.setAirline("Air");

        assertEquals(1L, res.getId());
        assertEquals("Name", res.getName());

        AdminUserResponse res2 = new AdminUserResponse(1L, "Name", "F", "L", "E", "P", "A", "R", true, "Air");
        assertEquals(res, res2);
        assertEquals(res.hashCode(), res2.hashCode());
        assertNotNull(res.toString());
    }

    @Test
    void testUpdateAdminReportRequest() {
        UpdateAdminReportRequest req = new UpdateAdminReportRequest();
        req.setReportName("Name");
        req.setDescription("Desc");
        req.setTotalRevenue(BigDecimal.ONE);
        req.setTotalBookings(1L);
        req.setTotalFlights(2L);
        req.setActiveUsers(3L);

        assertEquals("Name", req.getReportName());

        UpdateAdminReportRequest req2 = new UpdateAdminReportRequest("Name", "Desc", BigDecimal.ONE, 1L, 2L, 3L);
        assertEquals(req, req2);
        assertEquals(req.hashCode(), req2.hashCode());
        assertNotNull(req.toString());
    }

    @Test
    void testAdminReport() {
        AdminReport entity = new AdminReport();
        entity.setId(1L);
        entity.setReportName("Name");
        entity.setDescription("Desc");
        entity.setReportType(AdminReport.ReportType.WEEKLY);
        entity.setTotalRevenue(BigDecimal.ONE);
        entity.setTotalBookings(1L);
        entity.setTotalFlights(2L);
        entity.setActiveUsers(3L);

        assertEquals(1L, entity.getId());
        
        AdminReport entity2 = new AdminReport(1L, "Name", "Desc", AdminReport.ReportType.WEEKLY, BigDecimal.ONE, 1L, 2L, 3L, null, null);
        assertNotNull(entity.toString());
    }

    @Test
    void testAuditLog() {
        AuditLog log = new AuditLog();
        log.setId(1L);
        log.setActor("Actor");
        log.setAction("Action");
        log.setTargetType("TargetType");
        log.setTargetId("TargetId");
        log.setDetails("Details");
        log.setCreatedAt(LocalDateTime.now());

        assertEquals(1L, log.getId());

        AuditLog log2 = new AuditLog(1L, "Actor", "Action", "TargetType", "TargetId", "Details", log.getCreatedAt());
        assertNotNull(log.toString());
    }

    @Test
    void testReportType() {
        assertEquals(AdminReport.ReportType.DAILY, AdminReport.ReportType.valueOf("DAILY"));
        assertTrue(AdminReport.ReportType.values().length > 0);
    }
}
