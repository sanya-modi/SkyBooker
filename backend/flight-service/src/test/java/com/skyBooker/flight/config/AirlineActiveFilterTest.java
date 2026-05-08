package com.skyBooker.flight.config;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

class AirlineActiveFilterTest {

    private RestTemplate restTemplate;
    private AirlineActiveFilter filter;

    @BeforeEach
    void setUp() {
        restTemplate = mock(RestTemplate.class);
        filter = new AirlineActiveFilter(restTemplate);
        ReflectionTestUtils.setField(filter, "airlineAirportServiceBaseUrl", "http://airline-airport");
        ReflectionTestUtils.setField(filter, "authServiceBaseUrl", "http://auth");
    }

    @Test
    void nonAirlineStaffRequestsPassThrough() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-User-Role", "PASSENGER");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
    }

    @Test
    void inactiveAirlineReturnsForbidden() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-User-Role", "AIRLINE_STAFF");
        request.addHeader("X-User-Email", "staff@test.com");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        Object userInfo = Class.forName("com.skyBooker.flight.config.AirlineActiveFilter$UserInfo")
                .getDeclaredConstructor()
                .newInstance();
        ReflectionTestUtils.setField(userInfo, "airlineId", 22L);

        doReturn(userInfo).when(restTemplate).getForObject("http://auth/auth/users/email/staff@test.com", userInfo.getClass());
        doThrow(new RestClientException("inactive"))
                .when(restTemplate).getForEntity("http://airline-airport/airlines/22/active", Object.class);

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(403);
        assertThat(response.getContentAsString()).contains("AIRLINE_INACTIVE");
        verify(chain, never()).doFilter(request, response);
    }

    @Test
    void authLookupFailuresFailOpen() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-User-Role", "AIRLINE_STAFF");
        request.addHeader("X-User-Email", "staff@test.com");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        doThrow(new RestClientException("auth down"))
                .when(restTemplate)
                .getForObject(eq("http://auth/auth/users/email/staff@test.com"), eq(Class.forName("com.skyBooker.flight.config.AirlineActiveFilter$UserInfo")));

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
        assertThat(response.getStatus()).isEqualTo(200);
    }
}
