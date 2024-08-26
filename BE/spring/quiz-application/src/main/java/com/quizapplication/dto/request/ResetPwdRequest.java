package com.quizapplication.dto.request;

import lombok.Getter;

@Getter
public class ResetPwdRequest {
    private String password;
    private String passwordConfirm;
}
