package com.quizapplication.exception.member;

import com.quizapplication.exception.common.BusinessException;
import com.quizapplication.exception.common.ErrorCode;

public class DuplicateEmailException extends BusinessException {

    private final static String code = "000_1";
    private final String MESSAGE = "이미 사용중인 이메일입니다.";

    public DuplicateEmailException() {
        super(ErrorCode.DUPLICATE_EMAIL_EXCEPTION);
    }

}
