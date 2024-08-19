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
import org.springframework.web.filter.OncePerRequestFilter;

@Slf4j
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final TokenProvider tokenProvider;
    private final RedisService redisService;

    private static final List<String> EXCLUDE_URL = List.of("/", "api/v1/login", "/sign-up", "/swagger-ui/**");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (shouldNotFilter(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String accessToken = tokenProvider.resolveAccessToken(request);

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