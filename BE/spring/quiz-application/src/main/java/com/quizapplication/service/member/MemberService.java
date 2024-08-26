package com.quizapplication.service.member;

import com.quizapplication.dto.request.SignupDto;
import com.quizapplication.dto.response.MemberResponse;
import com.quizapplication.dto.response.UserIdResponse;
import jakarta.servlet.http.HttpServletRequest;

public interface MemberService {
    MemberResponse signup(SignupDto signupDto);
    MemberResponse info();
    void logout(HttpServletRequest request);
    UserIdResponse findUserId(String email);
}
