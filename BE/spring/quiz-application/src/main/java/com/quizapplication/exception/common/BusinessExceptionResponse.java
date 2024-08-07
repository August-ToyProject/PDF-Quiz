package com.quizapplication.exception.common;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class BusinessExceptionResponse {

    private final int status;
    private final String message;

    public static BusinessExceptionResponse from(BusinessException e) {
        return new BusinessExceptionResponse(e.getStatus(), e.getMessage());
    }
}
