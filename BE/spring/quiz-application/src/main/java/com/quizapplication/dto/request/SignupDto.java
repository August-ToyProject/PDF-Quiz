package com.quizapplication.dto.request;

import com.quizapplication.domain.Member;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class SignupDto {

    @Schema(description = "이메일", defaultValue = "kyun9151@naver.com")
    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,6}$", message = "이메일 형식에 맞지 않습니다.")
    @NotBlank(message = "이메일을 입력해주세요.")
    private String email;

    @Schema(description = "비밀번호", defaultValue = "12345678")
    @Size(min = 8, message = "비밀번호는 최소 8자 이상입니다.")
    @NotBlank(message = "비밀번호를 입력해주세요.")
    private String password;

    public static Member toEntity(SignupDto signupDto) {
        return Member.builder()
                .email(signupDto.getEmail())
                .password(signupDto.getPassword())
                .build();
    }

}