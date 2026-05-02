package com.skyBooker.flight.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

/**
 * Per-request filter for AIRLINE_STAFF users.
 * On every request, checks if the staff member's airline is still active.
 * If the airline has been deactivated mid-session, returns 403 FORBIDDEN.
 */
@Component
public class AirlineActiveFilter extends OncePerRequestFilter {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${services.airline-airport.base-url:http://localhost:8082}")
    private String airlineAirportServiceBaseUrl;

    @Value("${services.auth.base-url:http://localhost:8081}")
    private String authServiceBaseUrl;

    public AirlineActiveFilter(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String userRole = request.getHeader("X-User-Role");
        String userEmail = request.getHeader("X-User-Email");

        // Only enforce for AIRLINE_STAFF with an email present
        if ("AIRLINE_STAFF".equalsIgnoreCase(userRole) && userEmail != null && !userEmail.isBlank()) {
            try {
                // Fetch the user's airlineId from auth-service
                UserInfo userInfo = restTemplate.getForObject(
                        authServiceBaseUrl + "/auth/users/email/" + userEmail,
                        UserInfo.class
                );

                if (userInfo != null && userInfo.airlineId != null) {
                    try {
                        // Check if their airline is still active
                        restTemplate.getForEntity(
                                airlineAirportServiceBaseUrl + "/airlines/" + userInfo.airlineId + "/active",
                                Object.class
                        );
                        // Airline is active — continue
                    } catch (RestClientException e) {
                        System.out.println("[AIRLINE-FILTER] Blocking request: airline " + userInfo.airlineId
                                + " for staff " + userEmail + " is INACTIVE. Error: " + e.getMessage());
                        sendForbidden(response, "Your airline is inactive. Access denied.");
                        return;
                    }
                }
            } catch (RestClientException e) {
                // If auth-service is unreachable, log and allow (fail open to avoid outage)
                System.out.println("[AIRLINE-FILTER] Could not fetch user info for " + userEmail + ": " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }

    private void sendForbidden(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType("application/json");
        response.getWriter().write(
                objectMapper.writeValueAsString(Map.of(
                        "error", "AIRLINE_INACTIVE",
                        "message", message
                ))
        );
    }

    // Minimal DTO to deserialize airlineId from auth-service response
    private static class UserInfo {
        public Long airlineId;
        public String role;
        // Jackson needs a no-arg constructor
        public UserInfo() {}
    }
}
