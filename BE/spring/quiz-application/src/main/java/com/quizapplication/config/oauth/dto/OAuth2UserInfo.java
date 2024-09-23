package com.quizapplication.config.oauth.dto;

import java.util.Map;

public abstract class OAuth2UserInfo {

    // 추상클래스를 상속받는 클래스에서만 사용할 수 있도록 protected 제어자를 사용
    protected Map<String, Object> attributes;

    //  각 소셜 타입별 유저 정보 attributes 를 주입받아서 각 소셜 타입별 유저 정보 클래스가 소셜 타입에 맞는 attributes 를 주입받아 가지도록 함
    public OAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    // 소셜 식별 값 = 구글(sub), 네이버, 카카오(id)
    public abstract String getId();
    public abstract String getNickname();
    public abstract String getImageUrl();
    public abstract String getEmail();
}
