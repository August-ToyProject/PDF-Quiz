package com.quizapplication.controller;

import com.quizapplication.dto.request.SignupDto;
import com.quizapplication.dto.response.MemberResponse;
import com.quizapplication.service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "유저 관련 API 명세")
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1")
public class MemberController {

    private final MemberService memberService;

    @Operation(summary = "회원가입", description = "이메일 형식에 따라 작성하고 비밀번호는 최소 8자 이상")
    @PostMapping("/sign-up")
    public MemberResponse signup(@RequestBody @Valid SignupDto signupDto) {
        return memberService.signup(signupDto);
    }

}
