package com.quizapplication.dto.response.exam;

import com.quizapplication.domain.exam.Exam;
import com.quizapplication.dto.response.quiz.QuizResultResponse;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ExamResultResponse {
    private String title;
    private Integer setTime;
    private Integer spentTime;
    private List<QuizResultResponse> quizResults;

    public static ExamResultResponse of(Exam exam, List<QuizResultResponse> quizResults) {
        return ExamResultResponse.builder()
                .title(exam.getTitle())
                .setTime((int) exam.getSetTime().toSeconds())
                .spentTime((int) exam.getSpentTime().toSeconds())
                .quizResults(quizResults)
                .build();
    }

}
