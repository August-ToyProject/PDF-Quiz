package com.quizapplication.member;


import static com.quizapplication.domain.Role.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.quizapplication.domain.Member;
import com.quizapplication.domain.Role;
import com.quizapplication.dto.request.SignupDto;
import com.quizapplication.repository.MemberRepository;
import com.quizapplication.service.member.MemberService;
import com.quizapplication.service.member.MemberServiceImpl;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
public class MemberServiceTest {

    @Mock
    private MemberRepository memberRepository;

    /**
     * 테스트에서 중요한 것은 메서드의 내부 구현을 검증하는 것이 아니라, 해당 메서드의 호출과 입력값, 출력값에 대한 동작을 검증하는 것
     * 따라서 테스트 환경에서는 어떤 PasswordEncoder가 사용되는지보다는 그 동작이 올바르게 수행되는지 확인하는 것이 중요
     */
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private MemberServiceImpl memberService;

    private SignupDto validSignupDto;

    @BeforeEach
    void setUp() {
        validSignupDto = SignupDto.builder()
                .userId("valid9151")
                .email("valid@valid.com")
                .username("김명균")
                .nickname("valid")
                .password("a12345678")
                .passwordConfirm("a12345678")
                .build();
    }

    @DisplayName("정상적인 회원가입")
    @Test
    void MemberServiceTest() {
        Member member = Member.builder()
                .userId("valid9151")
                .email("valid@valid.com")
                .username("김명균")
                .nickname("valid")
                .password("a12345678")
                .role(ROLE_USER)
                .build();
        when(memberRepository.save(any())).thenReturn(member);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");

        // act
        memberService.signup(validSignupDto);

        // argument captor
        ArgumentCaptor<Member> memberArgumentCaptor = ArgumentCaptor.forClass(Member.class);

        // verify
        verify(memberRepository).save(memberArgumentCaptor.capture());

        Member savedMember = memberArgumentCaptor.getValue();

        assertThat(savedMember.getUserId()).isEqualTo("valid9151");
        assertThat(savedMember.getNickname()).isEqualTo("valid");
        assertThat(savedMember.getUsername()).isEqualTo("김명균");
        assertThat(savedMember.getPassword()).isEqualTo("encodedPassword");
        assertThat(savedMember.getRole()).isEqualTo(ROLE_USER);
        assertThat(savedMember.getEmail()).isEqualTo("valid@valid.com");
        assertThat(savedMember.getSocialId()).isNull();

    }
}
