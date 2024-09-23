package com.quizapplication.config.oauth.service;

import static com.quizapplication.domain.SocialType.*;

import com.quizapplication.config.oauth.dto.CustomOAuth2User;
import com.quizapplication.config.oauth.dto.OAuthAttribute;
import com.quizapplication.domain.Member;
import com.quizapplication.domain.SocialType;
import com.quizapplication.repository.MemberRepository;
import java.util.Collections;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2MemberService extends DefaultOAuth2UserService {

    private final MemberRepository memberRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

        log.info("CustomOAuth2UserService.loadUser() 실행 - OAuth2 로그인 요청 진입");

        /**
         * DefaultOAuth2UserService 객체를 생성하여, loadUser(userRequest)를 통해 DefaultOAuth2User 객체를 생성 후 반환
         * DefaultOAuth2UserService 의 loadUser()는 소셜 로그인 API 의 사용자 정보 제공 URI 로 요청을 보내서
         * 사용자 정보를 얻은 후, 이를 통해 DefaultOAuth2User 객체를 생성 후 반환한다.
         * 결과적으로, OAuth2User 는 OAuth 서비스에서 가져온 유저 정보를 담고 있는 유저
         */
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
        OAuth2User oAuth2User = delegate.loadUser(userRequest);


        // 구글, 카카오, 네이버 어느 것인지 확인
        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        // 소셜 타입 추출
        SocialType socialType = getSocialType(registrationId);

        // OAuth2 로그인 시 키(PK)가 되는 값
        String userNameAttributeName = userRequest.getClientRegistration()
                .getProviderDetails().getUserInfoEndpoint()
                .getUserNameAttributeName();

        // 소셜 로그인에서 API가 제공하는 userInfo의 Json 값(유저 정보들)
        Map<String, Object> attributes = oAuth2User.getAttributes();

        // SocialType 에 따라 유저 정보를 통해 OAuthAttributes 객체 생성
        OAuthAttribute extractedAttributes = OAuthAttribute.of(socialType, userNameAttributeName, attributes);

        Member createdMember = getUser(extractedAttributes, socialType);

        return new CustomOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority(createdMember.getRole().toString())),
                attributes,
                extractedAttributes.getNameAttributeKey(),
                createdMember.getEmail(),
                createdMember.getRole()
        );
    }

    private SocialType getSocialType(String registrationId) {
        if("naver".equals(registrationId)) {
            return NAVER;
        }
        if("kakao".equals(registrationId)) {
            return KAKAO;
        }
        return GOOGLE;
    }


    private Member getUser(OAuthAttribute attributes, SocialType socialType) {
        Member findUser = memberRepository.findBySocialTypeAndSocialId(socialType,
                attributes.getOAuth2UserInfo().getId());

        if(findUser == null) {
            return saveUser(attributes, socialType);
        }

        // refresh token logic 넣어야 함.

        return findUser;
    }

    /**
     * OAuthAttributes의 toEntity() 메소드를 통해 빌더로 User 객체 생성 후 반환
     * 생성된 User 객체를 DB에 저장 : socialType, socialId, email, role 값만 있는 상태
     */
    private Member saveUser(OAuthAttribute attributes, SocialType socialType) {
        Member createdMember = attributes.toEntity(socialType, attributes.getOAuth2UserInfo());
        return memberRepository.save(createdMember);
    }
}