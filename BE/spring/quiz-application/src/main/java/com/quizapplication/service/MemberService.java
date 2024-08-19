package com.quizapplication.service;

import com.quizapplication.dto.request.SignupDto;
import com.quizapplication.dto.response.MemberResponse;
import jakarta.servlet.http.HttpServletRequest;

public interface MemberService {
    MemberResponse signup(SignupDto signupDto);
    MemberResponse info();
    void logout(HttpServletRequest request);
}
