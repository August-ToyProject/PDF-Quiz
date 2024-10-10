package com.quizapplication.dto.request;

import static com.quizapplication.domain.Role.*;

import com.quizapplication.domain.Member;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SignupDto {

    @Schema(description = "아이디", defaultValue = "kyun9151")
    @Pattern(regexp = "^[A-Za-z0-9]+$", message = "아이디는 영어와 숫자만 포함")
    @NotBlank(message = "아이디를 입력해주세요.")
    private String userId;

    @Schema(description = "이메일", defaultValue = "kyun9151@naver.com")
    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,6}$", message = "이메일 형식에 맞지 않습니다.")
    @NotBlank(message = "이메일을 입력해주세요.")
    private String email;

    @Schema(description = "이름", defaultValue = "김명균")
    @Pattern(regexp = "^[가-힣]+$", message = "이름은 한글만 입력 가능합니다.")
    @Size(min = 2, max = 6, message = "이름은 2자 이상 6자 이하입니다.")
    @NotBlank(message = "이름을 입력해주세요.")
    private String username;

    @Schema(description = "닉네임", defaultValue = "hodumaru")
    @Size(min = 4, max = 20, message = "닉네임은 4자 이상 20자 이하입니다.")
    @NotBlank(message = "닉네임을 입력해주세요.")
    private String nickname;

    @Schema(description = "비밀번호", defaultValue = "12345678")
    @Pattern(regexp = "^[A-Za-z\\d]+$", message = "비밀번호는 영어와 숫자만 포함")
    @Size(min = 8, message = "비밀번호는 최소 8자 이상입니다.")
    @NotBlank(message = "비밀번호를 입력해주세요.")
    private String password;

    @Schema(description = "비밀번호 확인", defaultValue = "12345678")
    @Pattern(regexp = "^[A-Za-z\\d]+$", message = "비밀번호는 영어와 숫자만 포함")
    @Size(min = 8, message = "비밀번호는 최소 8자 이상입니다.")
    @NotBlank(message = "비밀번호를 입력을 확인해주세요.")
    private String passwordConfirm;

    public static Member toEntity(SignupDto signupDto) {
        return Member.builder()
                .userId(signupDto.getUserId())
                .email(signupDto.getEmail())
                .username(signupDto.getUsername())
                .nickname(signupDto.getNickname())
                .password(signupDto.getPassword())
                .role(ROLE_USER)
                .build();
    }

}