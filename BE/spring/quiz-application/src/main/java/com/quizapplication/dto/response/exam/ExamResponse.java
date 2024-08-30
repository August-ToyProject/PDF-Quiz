package com.quizapplication.dto.response.exam;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ExamResponse {
    private String title;
    private LocalDateTime examDate;

    public static ExamResponse of(String title, LocalDateTime examDate) {
        return ExamResponse.builder()
            .title(title)
            .examDate(examDate)
            .build();
    }
}
