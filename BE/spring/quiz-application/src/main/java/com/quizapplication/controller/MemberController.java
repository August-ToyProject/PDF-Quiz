package com.quizapplication.controller;

import com.quizapplication.dto.request.SignupDto;
import com.quizapplication.dto.response.MemberResponse;
import com.quizapplication.dto.response.UserIdResponse;
import com.quizapplication.service.member.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "유저 관련 API 명세")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class MemberController {

    private final MemberService memberService;

    @Operation(summary = "회원가입", description = "이메일 형식에 따라 작성하고 비밀번호는 최소 8자 이상")
    @PostMapping("/sign-up")
    public MemberResponse signup(@RequestBody @Valid SignupDto signupDto) {
        return memberService.signup(signupDto);
    }

    @GetMapping("/info")
    public ResponseEntity<MemberResponse> info() {
        return ResponseEntity.status(HttpStatus.OK).body(memberService.info());
    }

    @PatchMapping("/logout")
    public String logout(HttpServletRequest request) {
        memberService.logout(request);
        return "logout";
    }

    @Operation(summary = "아이디 찾기", description = "이메일만 PathVariable로 입력하면 해당 이메일에 해당하는 아이디를 반환")
    @GetMapping("/find-user")
    public ResponseEntity<UserIdResponse> findUser(@RequestParam(value = "email") String email) {
        return ResponseEntity.status(HttpStatus.OK).body(memberService.findUserId(email));
    }
}
