package com.quizapplication.service.member;

import static com.quizapplication.domain.Role.*;

import com.quizapplication.config.jwt.TokenProvider;
import com.quizapplication.config.redis.RedisService;
import com.quizapplication.config.security.SecurityUtil;
import com.quizapplication.domain.Member;
import com.quizapplication.domain.Role;
import com.quizapplication.domain.folder.Folder;
import com.quizapplication.dto.request.EditUserInfoDto;
import com.quizapplication.dto.request.ResetPwdRequest;
import com.quizapplication.dto.request.SignupDto;
import com.quizapplication.dto.request.folder.FolderCreateRequest;
import com.quizapplication.dto.response.FolderResponse;
import com.quizapplication.dto.response.MemberResponse;
import com.quizapplication.dto.response.UserIdResponse;
import com.quizapplication.exception.member.DuplicateEmailException;
import com.quizapplication.exception.member.PasswordMismatchException;
import com.quizapplication.repository.MemberRepository;
import com.quizapplication.repository.folder.FolderRepository;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {

    private final RedisService redisService;
    private final TokenProvider tokenProvider;
    private final MemberRepository memberRepository;
    private final FolderRepository folderRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    public void init() {
        Member member1 = Member.builder()
                .userId("kyun9151")
                .email("kyun9151@gmail.com")
                .username("김명균")
                .nickname("hodu1")
                .role(ROLE_USER)
                .password(passwordEncoder.encode("12345678"))
                .build();
        Member member2 = Member.builder()
                .userId("kyun9152")
                .email("kyun9152@gmail.com")
                .username("박준용")
                .nickname("hodu2")
                .role(ROLE_USER)
                .password(passwordEncoder.encode("12345678"))
                .build();

        Member member3 = Member.builder()
                .userId("kyun9153")
                .email("kyun9153@gmail.com")
                .username("최병우")
                .nickname("hodu3")
                .role(ROLE_USER)
                .password(passwordEncoder.encode("12345678"))
                .build();
        Member member4 = Member.builder()
                .userId("kyun9154")
                .email("kyun9154@gmail.com")
                .username("김덕빈")
                .nickname("hodu4")
                .role(ROLE_USER)
                .password(passwordEncoder.encode("12345678"))
                .build();
        memberRepository.saveAll(List.of(member1, member2, member3, member4));

    }
    @Override
    @Transactional
    public MemberResponse signup(SignupDto signupDto) {

        if (isEmailExist(signupDto.getEmail())) {
            throw new DuplicateEmailException();
        }

        if (!checkPassword(signupDto.getPassword(), signupDto.getPasswordConfirm())) {
            throw new PasswordMismatchException();
        }

        Member savedMember = memberRepository.save(SignupDto.toEntity(signupDto));
        savedMember.passwordEncoding(passwordEncoder);
        return MemberResponse.of(savedMember);
    }

    @Override
    public MemberResponse info() {
        return MemberResponse.of(memberRepository.findByEmail(SecurityUtil.getCurrentMemberEmail()));
    }

    @Override
    @Transactional
    public MemberResponse editInfo(EditUserInfoDto request) {
        Member member = memberRepository.findByEmail(SecurityUtil.getCurrentMemberEmail());
        member.editMember(request.getUserId(), request.getEmail(), request.getUsername(), request.getNickname());
        return MemberResponse.of(member);
    }

    @Override
    public void logout(HttpServletRequest request) {
        String accessToken = tokenProvider.getAccessToken(request);
        String email = tokenProvider.getClaims(accessToken).getSubject();
        String redisAccessToken = redisService.getValues(email);
        if (accessToken.equals(redisAccessToken)) {
            redisService.deleteValues(email);
            long accessTokenExpirationMillis = tokenProvider.getAccessTokenExpirationMillis();
            redisService.setValues(accessToken, "logout", Duration.ofMillis(accessTokenExpirationMillis));
        }

    }

    @Override
    public UserIdResponse findUserId(String email) {
        Member member = memberRepository.findByEmail(email);
        return UserIdResponse.of(member);
    }

    @Transactional
    @Override
    public void resetPassword(String email, ResetPwdRequest request) {

        if (!checkPassword(request.getPassword(), request.getPasswordConfirm())) {
            throw new PasswordMismatchException();
        }

        Member member = memberRepository.findByEmail(email);
        member.updatePassword(passwordEncoder, request.getPassword());
    }

    @Override
    public List<FolderResponse> folderInfo() {
        Member member = memberRepository.findByEmail(SecurityUtil.getCurrentMemberEmail());
        List<Folder> folders = member.getFolders();

        List<FolderResponse> result = new ArrayList<>();

        folders.stream().map(FolderResponse::of).forEach(result::add);

        return result;
    }

    @Override
    @Transactional
    public FolderResponse createFolder(FolderCreateRequest request) {
        Member member = memberRepository.findByEmail(SecurityUtil.getCurrentMemberEmail());
        Folder folder = Folder.builder()
                .folderName(request.getFolderName())
                .member(member)
                .build();
        Folder savedFolder = folderRepository.save(folder);
        member.addFolder(savedFolder);
        return FolderResponse.of(savedFolder);
    }

    @Override
    @Transactional
    public void deleteFolder(Long folderId) {
        Long memberId = memberRepository.findByEmail(SecurityUtil.getCurrentMemberEmail()).getId();
        folderRepository.delete(folderRepository.findByIdAndMemberId(folderId, memberId));
    }

    private boolean isEmailExist(String email) {
        return memberRepository.existsByEmail(email);
    }

    private boolean checkPassword(String password, String passwordConfirm) {
        return password.equals(passwordConfirm);
    }
}
