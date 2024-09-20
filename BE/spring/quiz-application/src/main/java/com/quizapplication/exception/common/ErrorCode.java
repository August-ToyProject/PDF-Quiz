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

    DUPLICATE_EMAIL_EXCEPTION(409, "000_1" ,"이미 사용중인 이메일입니다.", BAD_REQUEST),
    PASSWORD_MISMATCH_EXCEPTION(400, "000_2" ,"비밀번호가 일치하지 않습니다.", BAD_REQUEST),
    USERNAME_NOT_FOUND_EXCEPTION(404, "000_3" ,"해당하는 사용자 이름이 존재하지 없습니다.", NOT_FOUND),
    USER_NOT_FOUND_EXCEPTION(404, "000_4" ,"해당하는 사용자가 존재하지 않습니다.", NOT_FOUND),
    PDF_NOT_FOUND_EXCEPTION(404, "000_5" ,"해당하는 PDF 파일이 존재하지 않습니다.", NOT_FOUND);

    private final int status;
    private final String code;
    private final String message;
    private final HttpStatus  httpStatus;
}