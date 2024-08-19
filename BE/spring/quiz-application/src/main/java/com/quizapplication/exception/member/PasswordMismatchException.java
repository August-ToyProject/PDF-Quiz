package com.quizapplication.exception.member;

import com.quizapplication.exception.common.BusinessException;
import com.quizapplication.exception.common.ErrorCode;

public class PasswordMismatchException extends BusinessException {

    public PasswordMismatchException() {
        super(ErrorCode.PASSWORD_MISMATCH_EXCEPTION);
    }
}
