package com.skyBooker.admin.controller;

import com.skyBooker.admin.dto.AdminUserResponse;
import com.skyBooker.admin.service.AdminUserDirectoryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminUserController.class)
class AdminUserControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private AdminUserDirectoryService adminUserDirectoryService;

    @Test
    void getAllUsers() throws Exception {
        AdminUserResponse user = new AdminUserResponse();
        user.setId(1L);
        user.setName("admin");
        user.setEmail("admin@skybooker.com");
        
        when(adminUserDirectoryService.getAllUsers()).thenReturn(List.of(user));

        mockMvc.perform(get("/admin/users/all")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("admin"));
    }

    @Test
    void getAllUsersEmpty() throws Exception {
        when(adminUserDirectoryService.getAllUsers()).thenReturn(List.of());

        mockMvc.perform(get("/admin/users/all")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    void getAllUsersMultiple() throws Exception {
        AdminUserResponse user1 = new AdminUserResponse();
        user1.setId(1L);
        user1.setName("admin1");
        user1.setEmail("admin1@skybooker.com");
        user1.setRole("ADMIN");

        AdminUserResponse user2 = new AdminUserResponse();
        user2.setId(2L);
        user2.setName("passenger1");
        user2.setEmail("passenger1@skybooker.com");
        user2.setRole("PASSENGER");

        when(adminUserDirectoryService.getAllUsers()).thenReturn(List.of(user1, user2));

        mockMvc.perform(get("/admin/users/all")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("admin1"))
                .andExpect(jsonPath("$[1].name").value("passenger1"))
                .andExpect(jsonPath("$[0].role").value("ADMIN"))
                .andExpect(jsonPath("$[1].role").value("PASSENGER"));
    }

    @Test
    void getAllUsersCallsService() throws Exception {
        when(adminUserDirectoryService.getAllUsers()).thenReturn(List.of());

        mockMvc.perform(get("/admin/users/all"));

        verify(adminUserDirectoryService).getAllUsers();
    }

    @Test
    void getAllUsersWithCompleteData() throws Exception {
        AdminUserResponse user = new AdminUserResponse(
                1L, "John Doe", "John", "Doe", "john@test.com", 
                "1234567890", "LOCAL", "ADMIN", true, null
        );

        when(adminUserDirectoryService.getAllUsers()).thenReturn(List.of(user));

        mockMvc.perform(get("/admin/users/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].firstName").value("John"))
                .andExpect(jsonPath("$[0].lastName").value("Doe"))
                .andExpect(jsonPath("$[0].email").value("john@test.com"))
                .andExpect(jsonPath("$[0].role").value("ADMIN"));
    }

    @Test
    void getAllUsersResponseType() throws Exception {
        AdminUserResponse user = new AdminUserResponse();
        user.setId(1L);
        user.setName("test");

        when(adminUserDirectoryService.getAllUsers()).thenReturn(List.of(user));

        mockMvc.perform(get("/admin/users/all"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }
}
