package com.quizapplication.dto.request.exam;

import com.quizapplication.domain.Member;
import com.quizapplication.domain.exam.Exam;
import com.quizapplication.dto.response.quiz.QuizResult;
import java.time.Duration;
import java.util.List;
import lombok.Getter;

@Getter
public class ExamResultRequest {
    private String title;
    private Integer setTime;
    private Integer spentTime;
    private List<QuizResult> exam;

    public Exam toEntity(Member member) {
        return Exam.builder()
            .member(member)
            .title(title)
            .setTime(Duration.ofSeconds(setTime))
            .spentTime(Duration.ofSeconds(spentTime))
            .build();
    }

}

