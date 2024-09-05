package com.quizapplication.dto.response.exam;

import com.quizapplication.domain.exam.Exam;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ExamResultResponse {
    private String title;
    private Integer setTime;
    private Integer spentTime;

    public static ExamResultResponse of(Exam exam) {
        return ExamResultResponse.builder()
                .title(exam.getTitle())
                .setTime((int) exam.getSetTime().toMinutes())
                .spentTime((int) exam.getSpentTime().toMinutes())
                .build();
    }

}
