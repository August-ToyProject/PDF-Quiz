package com.quizapplication.dto.request;

import com.quizapplication.domain.Member;
import lombok.Getter;

@Getter
public class SignupDto {

    private String email;

    private String password;

    public static Member toEntity(SignupDto signupDto) {
        return Member.builder()
                .email(signupDto.getEmail())
                .password(signupDto.getPassword())
                .build();
    }

}