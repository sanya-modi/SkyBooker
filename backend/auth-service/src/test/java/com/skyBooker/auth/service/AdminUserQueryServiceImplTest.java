package com.skyBooker.auth.service;

import com.skyBooker.auth.dto.AdminUserSummaryResponse;
import com.skyBooker.auth.entity.User;
import com.skyBooker.auth.repository.AdminUserQueryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminUserQueryServiceImplTest {

    @Mock
    private AdminUserQueryRepository adminUserQueryRepository;

    @InjectMocks
    private AdminUserQueryServiceImpl service;

    @Test
    void trimsAndBuildsFullName() {
        User user = new User();
        user.setId(1L);
        user.setFirstName(" John ");
        user.setLastName(" Doe ");
        user.setEmail("john@test.com");
        user.setIsActive(true);

        when(adminUserQueryRepository.findAllByOrderByIdDesc()).thenReturn(List.of(user));

        List<AdminUserSummaryResponse> result = service.getAllUsers();

        assertThat(result.get(0).getName()).isEqualTo("John Doe");
    }

    @Test
    void handlesNullLastName() {
        User user = new User();
        user.setFirstName("Solo");
        user.setLastName(null);

        when(adminUserQueryRepository.findAllByOrderByIdDesc()).thenReturn(List.of(user));

        assertThat(service.getAllUsers().get(0).getName()).isEqualTo("Solo");
    }

    @Test
    void handlesNullFirstName() {
        User user = new User();
        user.setFirstName(null);
        user.setLastName("Doe");

        when(adminUserQueryRepository.findAllByOrderByIdDesc()).thenReturn(List.of(user));

        assertThat(service.getAllUsers().get(0).getName()).isEqualTo("Doe");
    }

    @Test
    void handlesBothNamesNull() {
        User user = new User();

        when(adminUserQueryRepository.findAllByOrderByIdDesc()).thenReturn(List.of(user));

        assertThat(service.getAllUsers().get(0).getName()).isEmpty();
    }
}