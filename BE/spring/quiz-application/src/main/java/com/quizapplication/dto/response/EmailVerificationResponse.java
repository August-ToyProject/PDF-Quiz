package com.quizapplication.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
public class EmailVerificationResponse {
    private boolean result;

    @Builder
    private EmailVerificationResponse(boolean result) {
        this.result = result;
    }

    public static EmailVerificationResponse of(boolean result) {
        return EmailVerificationResponse.builder().result(result).build();
    }
}
