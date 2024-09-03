package com.quizapplication.dto.response.exam;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ExamResponse {

    private Long id;
    private String title;
    private LocalDateTime examDate;

    public static ExamResponse of(Long id, String title, LocalDateTime examDate) {
        return ExamResponse.builder()
            .id(id)
            .title(title)
            .examDate(examDate)
            .build();
    }
}
