package com.quizapplication.controller;

import com.quizapplication.dto.request.EditUserInfoDto;
import com.quizapplication.dto.request.ResetPwdRequest;
import com.quizapplication.dto.request.SignupDto;
import com.quizapplication.dto.request.folder.FolderCreateRequest;
import com.quizapplication.dto.response.EmailVerificationResponse;
import com.quizapplication.dto.response.FolderResponse;
import com.quizapplication.dto.response.MemberResponse;
import com.quizapplication.dto.response.UserIdResponse;
import com.quizapplication.service.member.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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

    @Operation(summary = "개인정보 수정", description = "아이디, 이메일, 이름, 닉네임을 수정(Validation 체크)")
    @PutMapping("/info")
    public ResponseEntity<MemberResponse> editInfo(@RequestBody @Valid EditUserInfoDto request) {
        return ResponseEntity.status(HttpStatus.OK).body(memberService.editInfo(request));
    }

    @PatchMapping("/logout")
    public String logout(HttpServletRequest request) {
        memberService.logout(request);
        return "logout";
    }

    @Operation(summary = "아이디 찾기", description = "이메일만 QueryParam으로 입력하면 해당 이메일에 해당하는 아이디를 반환")
    @GetMapping("/find-user")
    public ResponseEntity<UserIdResponse> findUser(@RequestParam(value = "email") String email) {
        return ResponseEntity.status(HttpStatus.OK).body(memberService.findUserId(email));
    }

    @Operation(summary = "비밀번호 재설정", description = "이메일을 QueryParam으로 받아 비밀번호 재설정")
    @PutMapping("/find-pwd")
    public ResponseEntity resetPwd(@RequestParam(value = "email") String email,
                                   @RequestBody ResetPwdRequest request) {
        memberService.resetPassword(email, request);
        return ResponseEntity.status(HttpStatus.OK).body("Password reset successfully");
    }

    @Operation(summary = "생성한 폴더", description = "마이페이지에서 생성한 폴더 정보들 반환")
    @GetMapping("/folders")
    public ResponseEntity<List<FolderResponse>> folderInfo() {
        return ResponseEntity.status(HttpStatus.OK).body(memberService.folderInfo());
    }

    @Operation(summary = "폴더 정보 조회", description = "마이페이지에서 생성한 폴더 id를 기준으로 조회")
    @GetMapping("/folder-info")
    public ResponseEntity<FolderResponse> getFolder(@RequestParam("folderId") Long folderId) {
        return ResponseEntity.status(HttpStatus.OK).body(memberService.getFolder(folderId));
    }

    @Operation(summary = "폴더 생성", description = "마이페이지에서 폴더 생성")
    @PostMapping("/folders")
    public ResponseEntity<FolderResponse> createFolder(@RequestBody FolderCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(memberService.createFolder(request));
    }

    @Operation(summary = "폴더 삭제", description = "마이페이지에서 생성한 폴더 id를 기준으로 삭제")
    @DeleteMapping("/folders")
    public ResponseEntity deleteFolder(@RequestParam("folderId") Long folderId) {
        memberService.deleteFolder(folderId);
        return ResponseEntity.status(HttpStatus.OK).body("Folder deleted successfully");
    }

    @Operation(summary = "폴더 변경", description = "마이페이지에서 생성한 폴더 id를 기준으로 변경")
    @PutMapping("/folders")
    public ResponseEntity<FolderResponse> updateFolder(@RequestParam("folderId") Long folderId,
                                                       @RequestBody FolderCreateRequest request) {
        return ResponseEntity.status(HttpStatus.OK).body(memberService.updateFolder(folderId, request));
    }

    @Operation(summary = "이메일 인증번호 보내기", description = "이메일을 받아 이메일 보내기")
    @PostMapping("/emails/verification-requests")
    public ResponseEntity sendEmail(@RequestParam("email") String email) {
        memberService.sendCode(email);
        return new ResponseEntity(HttpStatus.OK);
    }

    @Operation(summary = "이메일 인증번호 인증", description = "이메일, 인증번호를 받아 이메일 보내기")
    @GetMapping("/emails/verify-code")
    public EmailVerificationResponse verifyCode(@RequestParam("email") String email,
                                                @RequestParam("code") String code) {
        return memberService.verifyCode(email, code);
    }
}
