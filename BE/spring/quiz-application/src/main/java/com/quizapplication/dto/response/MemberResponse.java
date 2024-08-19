package com.quizapplication.dto.response;

import com.quizapplication.domain.Member;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MemberResponse {

    private String userId;
    private String email;
    private String username;
    private String nickname;

    public static MemberResponse of(Member member) {
        return MemberResponse.builder()
                .userId(member.getUserId())
                .email(member.getEmail())
                .username(member.getUsername())
                .nickname(member.getNickname())
                .build();
    }
}
