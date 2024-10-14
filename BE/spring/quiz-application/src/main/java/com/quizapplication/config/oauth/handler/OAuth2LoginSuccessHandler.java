    package com.quizapplication.config.oauth.handler;

    import com.quizapplication.config.jwt.TokenDto;
    import com.quizapplication.config.jwt.TokenProvider;
    import com.quizapplication.config.oauth.dto.CustomOAuth2User;
    import com.quizapplication.config.redis.RedisService;
    import com.quizapplication.domain.Role;
    import jakarta.servlet.ServletException;
    import jakarta.servlet.http.HttpServletRequest;
    import jakarta.servlet.http.HttpServletResponse;
    import java.io.IOException;
    import java.time.Duration;
    import java.util.stream.Collectors;
    import lombok.RequiredArgsConstructor;
    import lombok.extern.slf4j.Slf4j;
    import org.springframework.security.core.Authentication;
    import org.springframework.security.core.GrantedAuthority;
    import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
    import org.springframework.stereotype.Component;

    @Slf4j
    @Component
    @RequiredArgsConstructor
    public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {
        private final TokenProvider tokenProvider;
        private final RedisService redisService;

        @Override
        public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                            Authentication authentication) throws IOException, ServletException {

            try {
                CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
                log.info(oAuth2User.getEmail());
                log.info(oAuth2User.getName().toString());


                // 사용자 권한
                String authorities = oAuth2User.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.joining(","));
                log.info(authorities);


                // 이미 가입된 회원의 경우 바로 토큰 발급해주면 된다.
    //            TokenDto tokenDto = tokenProvider.generateToken(authentication);
                TokenDto tokenDto = tokenProvider.generateTokenDtoOAuth(oAuth2User.getEmail(), authorities);
                tokenProvider.setAccessToken(response, tokenDto.getAccessToken());

                long accessTokenExpirationMillis = tokenProvider.getAccessTokenExpirationMillis();
                redisService.setValues(oAuth2User.getEmail(), tokenDto.getAccessToken(),
                        Duration.ofMillis(accessTokenExpirationMillis));
                response.sendRedirect("http://localhost:5173/mypage?token=" + tokenDto.getAccessToken());

            } catch (Exception e) {
                throw e;
            }

        }
    }