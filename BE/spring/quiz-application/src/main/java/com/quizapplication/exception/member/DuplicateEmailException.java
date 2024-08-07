package com.quizapplication.exception.member;

import com.quizapplication.exception.common.BusinessException;
import com.quizapplication.exception.common.ErrorCode;

public class DuplicateEmailException extends BusinessException {

    public DuplicateEmailException() {
        super(ErrorCode.DUPLICATE_EMAIL_EXCEPTION);
    }

}
