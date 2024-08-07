package com.quizapplication.dto.response;

import com.quizapplication.domain.Member;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MemberResponse {
    private String email;

    @Builder
    public MemberResponse(String email, String username) {
        this.email = email;
    }

    public static MemberResponse of(Member member) {
        return MemberResponse.builder()
                .email(member.getEmail())
                .build();
    }
}
