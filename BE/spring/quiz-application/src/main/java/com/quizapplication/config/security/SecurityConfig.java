package com.quizapplication.config.security;

import com.quizapplication.config.jwt.JwtFilter;
import com.quizapplication.config.jwt.TokenProvider;
//import com.quizapplication.config.oauth.handler.OAuth2LoginFailureHandler;
//import com.quizapplication.config.oauth.handler.OAuth2LoginSuccessHandler;
//import com.quizapplication.config.oauth.service.CustomOAuth2MemberService;
import com.quizapplication.config.oauth.handler.OAuth2LoginFailureHandler;
import com.quizapplication.config.oauth.handler.OAuth2LoginSuccessHandler;
import com.quizapplication.config.oauth.service.CustomOAuth2MemberService;
import com.quizapplication.config.redis.RedisService;
import com.quizapplication.config.security.handler.LoginFailureHandler;
import com.quizapplication.config.security.handler.LoginSuccessHandler;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final TokenProvider tokenProvider;
    private final RedisService redisService;
    private final CustomOAuth2MemberService oAuth2MemberService;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final OAuth2LoginFailureHandler oAuth2LoginFailureHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .csrf((csrf) -> csrf.disable())
                .formLogin((formLogin) -> formLogin.disable())
                .httpBasic((httpBasic) -> httpBasic.disable())
                .headers((e) -> e.frameOptions((a) -> a.sameOrigin()))
                .authorizeHttpRequests((requests) -> requests.anyRequest().permitAll())
//                .authorizeHttpRequests(authRequests -> authRequests
//                        .requestMatchers("/api/v1/login").permitAll() // 특정 경로는 인증 없이 접근 허용
//                        .anyRequest().authenticated())
                .cors(cors -> cors.configurationSource(getCorsConfiguration()))
                .oauth2Login((oauth2) -> oauth2.userInfoEndpoint(
                                userInfoEndpointConfig -> userInfoEndpointConfig.userService(oAuth2MemberService))
                        .successHandler(oAuth2LoginSuccessHandler)
                        .failureHandler(oAuth2LoginFailureHandler))
                .with(new CustomFilterConfigurer(), Customizer.withDefaults());
//        http.addFilterBefore(new JwtFilter(tokenProvider, redisService), CustomAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    CorsConfigurationSource getCorsConfiguration() {
        CorsConfiguration config = new CorsConfiguration();
//        config.setAllowedOrigins(Collections.singletonList("https://quizgen.site"));
        config.setAllowedOriginPatterns(Collections.singletonList("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowCredentials(true);
        config.setAllowedHeaders(Collections.singletonList("*"));
        config.addExposedHeader("Authorization");
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    public class CustomFilterConfigurer extends AbstractHttpConfigurer<CustomFilterConfigurer, HttpSecurity> {

        @Override
        public void configure(HttpSecurity builder) throws Exception {
            AuthenticationManager authenticationManager = builder.getSharedObject(AuthenticationManager.class);

            CustomAuthenticationFilter customAuthenticationFilter =
                    new CustomAuthenticationFilter(authenticationManager, tokenProvider, redisService);
            customAuthenticationFilter.setFilterProcessesUrl("/api/v1/login");
            customAuthenticationFilter.setAuthenticationSuccessHandler(new LoginSuccessHandler());
            customAuthenticationFilter.setAuthenticationFailureHandler(new LoginFailureHandler());
            builder.addFilter(customAuthenticationFilter)
                    .addFilterBefore(new JwtFilter(tokenProvider, redisService), CustomAuthenticationFilter.class);
        }
    }

}
