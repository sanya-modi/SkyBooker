package com.skyBooker.gateway.filter;

import com.skyBooker.gateway.config.JwtTokenProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    private final JwtTokenProvider jwtTokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        super(Config.class);
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {

            String path = exchange.getRequest().getURI().getPath();

            if (path.startsWith("/auth/login") || path.startsWith("/auth/register") ||
                path.startsWith("/payments/webhooks/") ||
                path.startsWith("/airports/airports") ||
                path.startsWith("/airlines/airlines") ||
                path.startsWith("/flights/flights/search") ||
                path.startsWith("/flights/search") ||
                path.contains("/v3/api-docs") || path.contains("/swagger-ui") || path.contains("/webjars")) {
                return chain.filter(exchange);
            }

            String authHeader = exchange.getRequest()
                    .getHeaders()
                    .getFirst(HttpHeaders.AUTHORIZATION);

            String tokenFromQuery = exchange.getRequest().getQueryParams().getFirst("token");
            boolean seatStreamRequest = path.contains("/seats/flight/") && path.endsWith("/stream");
            if ((authHeader == null || !authHeader.startsWith("Bearer ")) && seatStreamRequest && tokenFromQuery != null && !tokenFromQuery.isBlank()) {
                authHeader = "Bearer " + tokenFromQuery;
            }

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.error("Missing or invalid Authorization header");
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            try {
                String token = authHeader.substring(7);

                jwtTokenProvider.validateToken(token);

                String username = jwtTokenProvider.extractUsername(token);
                String role = jwtTokenProvider.extractRole(token);
                String email = username;
                String name = username;

                if (path.startsWith("/admin") && !"ADMIN".equalsIgnoreCase(role)) {
                    log.error("Access denied for user: {}", username);
                    exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
                    return exchange.getResponse().setComplete();
                }

                var mutatedRequest = exchange.getRequest().mutate()
                        .header("X-User-Id", username)
                        .header("X-User-Role", role)
                        .header("X-User-Email", email)
                        .header("X-User-Name", name)
                        .build();

                var mutatedExchange = exchange.mutate()
                        .request(mutatedRequest)
                        .build();

                return chain.filter(mutatedExchange);

            } catch (Exception e) {
                log.error("JWT validation failed: {}", e.getMessage());
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }
        };
    }

    public static class Config {
    }
}
