package com.quizapplication.service.member;

import com.quizapplication.dto.request.EditUserInfoDto;
import com.quizapplication.dto.request.ResetPwdRequest;
import com.quizapplication.dto.request.SignupDto;
import com.quizapplication.dto.request.folder.FolderCreateRequest;
import com.quizapplication.dto.response.EmailVerificationResponse;
import com.quizapplication.dto.response.FolderResponse;
import com.quizapplication.dto.response.MemberResponse;
import com.quizapplication.dto.response.UserIdResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

public interface MemberService {
    MemberResponse signup(SignupDto signupDto);
    MemberResponse info();
    MemberResponse editInfo(EditUserInfoDto request);
    void logout(HttpServletRequest request);
    UserIdResponse findUserId(String email);
    void resetPassword(String email, ResetPwdRequest resetPwdRequest);
    void sendCode(String email);
    EmailVerificationResponse verifyCode(String email, String code);

    List<FolderResponse> folderInfo();
    FolderResponse getFolder(Long folderId);
    FolderResponse createFolder(FolderCreateRequest request);
    void deleteFolder(Long folderId);
    FolderResponse updateFolder(Long folderId, FolderCreateRequest request);
}
