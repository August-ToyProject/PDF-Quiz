package com.quizapplication.dto.response;

import com.quizapplication.domain.Member;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserIdResponse {

    private String userId;

    public static UserIdResponse of(Member member) {
        return UserIdResponse.builder()
                .userId(member.getUserId())
                .build();
    }
}
