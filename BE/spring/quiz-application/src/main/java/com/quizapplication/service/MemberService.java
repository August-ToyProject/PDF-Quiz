package com.quizapplication.service;

import com.quizapplication.dto.request.SignupDto;
import com.quizapplication.dto.response.MemberResponse;

public interface MemberService {
    MemberResponse signup(SignupDto signupDto);
}
