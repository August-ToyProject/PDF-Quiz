package com.quizapplication.service;

import com.quizapplication.config.jwt.TokenProvider;
import com.quizapplication.config.redis.RedisService;
import com.quizapplication.config.security.SecurityUtil;
import com.quizapplication.domain.Member;
import com.quizapplication.dto.request.SignupDto;
import com.quizapplication.dto.response.MemberResponse;
import com.quizapplication.exception.member.DuplicateEmailException;
import com.quizapplication.exception.member.PasswordMismatchException;
import com.quizapplication.repository.MemberRepository;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {

    private final RedisService redisService;
    private final TokenProvider tokenProvider;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public MemberResponse signup(SignupDto signupDto) {

        if (isEmailExist(signupDto.getEmail())) {
            throw new DuplicateEmailException();
        }

        if (!checkPassword(signupDto.getPassword(), signupDto.getPasswordConfirm())) {
            throw new PasswordMismatchException();
        }

        Member savedMember = memberRepository.save(SignupDto.toEntity(signupDto));
        savedMember.passwordEncoding(passwordEncoder);
        return MemberResponse.of(savedMember);
    }

    @Override
    public MemberResponse info() {
        return MemberResponse.of(memberRepository.findByEmail(SecurityUtil.getCurrentMemberEmail()));
    }

    @Override
    public void logout(HttpServletRequest request) {
        String accessToken = tokenProvider.getAccessToken(request);
        String email = tokenProvider.getClaims(accessToken).getSubject();
        String redisAccessToken = redisService.getValues(email);
        if (accessToken.equals(redisAccessToken)) {
            redisService.deleteValues(email);
            long accessTokenExpirationMillis = tokenProvider.getAccessTokenExpirationMillis();
            redisService.setValues(accessToken, "logout", Duration.ofMillis(accessTokenExpirationMillis));
        }

    }

    private boolean isEmailExist(String email) {
        return memberRepository.existsByEmail(email);
    }

    private boolean checkPassword(String password, String passwordConfirm) {
        return password.equals(passwordConfirm);
    }
}
