package com.quizapplication.exception.common;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    DUPLICATE_EMAIL_EXCEPTION(409, "이미 사용중인 이메일입니다.", BAD_REQUEST),
    PASSWORD_MISMATCH_EXCEPTION(400, "비밀번호가 일치하지 않습니다.", BAD_REQUEST);

    private final int status;
    private final String message;
    private final HttpStatus  httpStatus;
}