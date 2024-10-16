package com.quizapplication.service.member;

import static com.quizapplication.domain.Role.*;

import com.quizapplication.config.jwt.TokenProvider;
import com.quizapplication.config.mail.MailService;
import com.quizapplication.config.redis.RedisService;
import com.quizapplication.config.security.SecurityUtil;
import com.quizapplication.domain.Member;
import com.quizapplication.domain.Role;
import com.quizapplication.domain.exam.Exam;
import com.quizapplication.domain.folder.Folder;
import com.quizapplication.domain.pdf.Pdf;
import com.quizapplication.domain.quiz.Quiz;
import com.quizapplication.dto.request.EditUserInfoDto;
import com.quizapplication.dto.request.ResetPwdRequest;
import com.quizapplication.dto.request.SignupDto;
import com.quizapplication.dto.request.folder.FolderCreateRequest;
import com.quizapplication.dto.response.EmailVerificationResponse;
import com.quizapplication.dto.response.FolderResponse;
import com.quizapplication.dto.response.MemberResponse;
import com.quizapplication.dto.response.UserIdResponse;
import com.quizapplication.exception.member.DuplicateEmailException;
import com.quizapplication.exception.member.PasswordMismatchException;
import com.quizapplication.repository.MemberRepository;
import com.quizapplication.repository.exam.ExamRepository;
import com.quizapplication.repository.folder.FolderRepository;
import com.quizapplication.repository.pdf.PdfRepository;
import com.quizapplication.repository.quiz.QuizRepository;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {

    private final RedisService redisService;
    private final TokenProvider tokenProvider;
    private final MemberRepository memberRepository;
    private final FolderRepository folderRepository;
    private final QuizRepository quizRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;

    @Value("${mail.expiration}")
    private long authCodeExpirationMills;

    @Value("${mail.length}")
    private int length;

    @Value("${mail.chars}")
    private String characters;

    @Value("${mail.numbers}")
    private String numbers;

    private static final String AUTH_CODE_PREFIX = "AuthCode ";

//    @PostConstruct
//    public void init() {
//        Member member1 = Member.builder()
//                .userId("kyun9151")
//                .email("kyun9151@gmail.com")
//                .username("김명균")
//                .nickname("hodu1")
//                .role(ROLE_USER)
//                .password(passwordEncoder.encode("12345678"))
//                .build();
//
//
//        Member member2 = Member.builder()
//                .userId("kyun9152")
//                .email("kyun9152@gmail.com")
//                .username("박준용")
//                .nickname("hodu2")
//                .role(ROLE_USER)
//                .password(passwordEncoder.encode("12345678"))
//                .build();
//
//        Member member3 = Member.builder()
//                .userId("kyun9153")
//                .email("kyun9153@gmail.com")
//                .username("최병우")
//                .nickname("hodu3")
//                .role(ROLE_USER)
//                .password(passwordEncoder.encode("12345678"))
//                .build();
//
//        Member member4 = Member.builder()
//                .userId("kyun9154")
//                .email("kyun9154@gmail.com")
//                .username("김덕빈")
//                .nickname("hodu4")
//                .role(ROLE_USER)
//                .password(passwordEncoder.encode("12345678"))
//                .build();
//
//        Member member5 = Member.builder()
//                .userId("kyun9155")
//                .email("kyun9155@gmail.com")
//                .username("김명균5")
//                .nickname("hodu5")
//                .role(ROLE_USER)
//                .password(passwordEncoder.encode("12345678"))
//                .build();
//        Quiz quiz1 = Quiz.builder()
//                .answer("{\"3\": \"교차 관심사(cross-cutting concerns)를 모듈화하는 것\"}")
//                .description("AOP의 주요 목적은 교차 관심사(cross-cutting concerns)를 모듈화하여 코드의 가독성과 유지보수성을 높이는 것입니다.")
//                .difficulty("어려움")
//                .options(
//                        "{\"1\": \"코드의 재사용성을 높이는 것\", \"2\": \"애플리케이션의 성능을 향상시키는 것\", \"3\": \"교차 관심사(cross-cutting concerns)를 모듈화하는 것\", \"4\": \"데이터베이스와의 연결을 단순화하는 것\", \"5\": \"사용자 인터페이스(UI)를 개선하는 것\"}")
//                .member(member1)
//                .build();
//        memberRepository.saveAll(List.of(member1, member2, member3, member4, member5));
//        quizRepository.save(quiz1);
//    }
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
//        Member savedMember = memberRepository.save(
//                Member.builder()
//                        .userId(signupDto.getUserId())
//                        .username(signupDto.getUsername())
//                        .nickname(signupDto.getNickname())
//                        .email(signupDto.getEmail())
//                        .role(ROLE_USER)
//                        .password(passwordEncoder.encode(signupDto.getPassword()))
//                        .build()
//        );
        return MemberResponse.of(savedMember);
    }

    @Override
    public MemberResponse info() {
        log.info(SecurityUtil.getCurrentMemberEmail());
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
    public void sendCode(String email) {
        String title = "이메일 인증 번호";
        String authCode = createCode();

        mailService.sendEmail(email, title, authCode);

        redisService.setValues(AUTH_CODE_PREFIX + email, authCode, Duration.ofMillis(authCodeExpirationMills));
    }

    @Override
    public EmailVerificationResponse verifyCode(String email, String code) {
        if (checkCode(email, code)) {
            Member findMember = memberRepository.findByEmail(email);
//            findMember.updateRole(ROLE_USER);
            return EmailVerificationResponse.of(true);
        }
        return EmailVerificationResponse.of(false);
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
    public FolderResponse getFolder(Long folderId) {
        Long memberId = memberRepository.findByEmail(SecurityUtil.getCurrentMemberEmail()).getId();
        Folder folder = folderRepository.findByIdAndMemberId(folderId, memberId);
        return FolderResponse.of(folder);
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

    @Override
    @Transactional
    public FolderResponse updateFolder(Long folderId, FolderCreateRequest request) {
        Long memberId = memberRepository.findByEmail(SecurityUtil.getCurrentMemberEmail()).getId();
        Folder folder = folderRepository.findByIdAndMemberId(folderId, memberId);
        folder.updateFolderName(request.getFolderName());
        return FolderResponse.of(folder);
    }

    private boolean isEmailExist(String email) {
        return memberRepository.existsByEmail(email);
    }

    private boolean checkPassword(String password, String passwordConfirm) {
        return password.equals(passwordConfirm);
    }

    private boolean checkCode(String email, String code) {
        return code.equals(redisService.getValues(AUTH_CODE_PREFIX + email));
    }

    // 인증번호 생성로직
    private String createCode() {
        StringBuilder sb = new StringBuilder(length); // 7
        StringBuilder sbNumber = new StringBuilder(length);
        Random random = new Random();

        for (int i = 0; i < length; i++) {
            int index = random.nextInt(characters.length()); // 인덱스 뽑고
            sb.append(characters.charAt(index)); // 문자열 인덱스 랜덤으로 가져오기
        }

        for (int i = 0; i < length; i++) {
            int index = random.nextInt(characters.length()); // 인덱스 뽑고
            sb.append(characters.charAt(index)); // 문자열 인덱스 랜덤으로 가져오기
        }

        return sb.toString();
    }
}
