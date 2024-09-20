package com.quizapplication.config.oauth.dto;


import com.quizapplication.domain.Member;
import com.quizapplication.domain.Role;
import com.quizapplication.domain.SocialType;
import java.util.Map;
import lombok.Builder;
import lombok.Getter;

@Getter
public class OAuthAttribute {
    private String nameAttributeKey;
    private OAuth2UserInfo oAuth2UserInfo;

    @Builder
    private OAuthAttribute(String nameAttributeKey, OAuth2UserInfo oAuth2UserInfo) {
        this.nameAttributeKey = nameAttributeKey;
        this.oAuth2UserInfo = oAuth2UserInfo;
    }

    /**
     * SocialType에 맞는 메소드 호출하여 OAuthAttributes 객체 반환
     * 파라미터 : userNameAttributeName -> OAuth2 로그인 시 키(PK)가 되는 값 / attributes : OAuth 서비스의 유저 정보들
     * 소셜별 of 메소드(ofGoogle, ofKaKao, ofNaver)들은 각각 소셜 로그인 API에서 제공하는
     * 회원의 식별값(id), attributes, nameAttributeKey를 저장 후 build
     */

    public static OAuthAttribute of(SocialType socialType,
                                    String userNameAttributeName, Map<String, Object> attributes) {
//        if (socialType == SocialType.NAVER) {
//            return ofNaver(userNameAttributeName, attributes);
//        }
//        if (socialType == SocialType.KAKAO) {
//            return ofKakao(userNameAttributeName, attributes);
//        }
        return ofGoogle(userNameAttributeName, attributes);
    }

//    private static OAuthAttribute ofKakao(String userNameAttributeName, Map<String, Object> attributes) {
//        return OAuthAttribute.builder()
//                .nameAttributeKey(userNameAttributeName)
//                .oAuth2UserInfo(new KakaoOAuth2UserInfo(attributes))
//                .build();
//    }

    public static OAuthAttribute ofGoogle(String userNameAttributeName, Map<String, Object> attributes) {
        return OAuthAttribute.builder()
                .nameAttributeKey(userNameAttributeName)
                .oAuth2UserInfo(new GoogleOAuth2UserInfo(attributes))
                .build();
    }

//    public static OAuthAttribute ofNaver(String userNameAttributeName, Map<String, Object> attributes) {
//        return OAuthAttribute.builder()
//                .nameAttributeKey(userNameAttributeName)
//                .oAuth2UserInfo(new NaverOAuth2UserInfo(attributes))
//                .build();
//    }

    public Member toEntity(SocialType socialType, OAuth2UserInfo oauth2UserInfo) {
        return Member.builder()
                .nickname(oauth2UserInfo.getNickname())
                .email(oauth2UserInfo.getEmail())
                .socialId(oauth2UserInfo.getId())
                .role(Role.ROLE_USER)
                .password("Audtka!@3443")
                .socialType(socialType)
                .build();
    }
}
