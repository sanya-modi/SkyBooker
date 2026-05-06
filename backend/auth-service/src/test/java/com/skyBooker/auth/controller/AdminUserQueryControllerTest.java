package com.skyBooker.auth.controller;

import com.skyBooker.auth.dto.AdminUserSummaryResponse;
import com.skyBooker.auth.entity.User;
import com.skyBooker.auth.service.AdminUserQueryService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AdminUserQueryControllerTest {

    private final AdminUserQueryService adminUserQueryService = mock(AdminUserQueryService.class);
    private final AdminUserQueryController controller = new AdminUserQueryController(adminUserQueryService);

    @Test
    void getAllUsersReturnsServiceResponse() {
        AdminUserSummaryResponse responseBody = new AdminUserSummaryResponse(
                1L, "John Doe", "John", "Doe", "john@test.com", "9876543210",
                User.AuthProvider.LOCAL, User.UserRole.ADMIN, true, "Sky Booker"
        );
        when(adminUserQueryService.getAllUsers()).thenReturn(List.of(responseBody));

        ResponseEntity<List<AdminUserSummaryResponse>> response = controller.getAllUsers();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactly(responseBody);
    }
}
