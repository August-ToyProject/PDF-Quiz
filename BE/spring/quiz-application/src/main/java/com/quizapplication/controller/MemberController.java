package com.quizapplication.controller;

import com.quizapplication.dto.request.SignupDto;
import com.quizapplication.dto.response.MemberResponse;
import com.quizapplication.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1")
public class MemberController {

    private final MemberService memberService;

    @PostMapping("/sign-up")
    public MemberResponse signup(@RequestBody SignupDto signupDto) {
        return memberService.signup(signupDto);
    }

}
