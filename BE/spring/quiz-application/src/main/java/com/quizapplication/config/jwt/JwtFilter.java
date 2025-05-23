package com.quizapplication.config.jwt;

import com.quizapplication.config.redis.RedisService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Slf4j
@RequiredArgsConstructor
@Component
public class JwtFilter extends OncePerRequestFilter {

    private final TokenProvider tokenProvider;
    private final RedisService redisService;

    private static final List<String> EXCLUDE_URL = List.of("/api/v1/login", "/api/v1/sign-up", "/swagger-ui",
            "/v3/api-docs",
            "/swagger-resources",
            "/webjars",
            "/favicon.ico",
            "/api/v1/find-user", "/api/v1/find-pwd",
            "/actuator/health",
            "/actuator/info", "/oauth2");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        log.info("Request URL: {}", request.getServletPath());
        if (shouldNotFilter(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        if (request.getHeader("Authorization") == null) {
            log.info("Token is missing or empty");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Token is missing or empty");
            response.getWriter().flush();
            return;
        }


        String accessToken = tokenProvider.resolveAccessToken(request);
        log.info("accessToken: {}", accessToken);
        if (!isLogout(accessToken)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Token has been logged out");
            return;
        }

        if (tokenProvider.validateToken(accessToken) && isLogout(accessToken)) {
            Authentication authentication = tokenProvider.getAuthentication(accessToken);
            SecurityContextHolder.getContextHolderStrategy().getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String servletPath = request.getServletPath();
        return EXCLUDE_URL.stream().anyMatch(exclude -> servletPath.equalsIgnoreCase(exclude) ||
                servletPath.startsWith(exclude) ||
                servletPath.matches(exclude));
    }

    private boolean isLogout(String accessToken) {
        return redisService.getValues(accessToken).equals("false");
    }
}