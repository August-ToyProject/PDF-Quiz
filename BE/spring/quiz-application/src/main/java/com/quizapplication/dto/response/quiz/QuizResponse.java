package com.quizapplication.dto.response.quiz;

import com.quizapplication.domain.quiz.Quiz;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@Builder
@ToString
public class QuizResponse {

    private Long quizId;

    private String difficulty;

    private String question;

    private String options;

    private String answer;

    private String description;

    public static QuizResponse of(Quiz quiz) {
        return QuizResponse.builder()
                .quizId(quiz.getId())
                .difficulty(quiz.getDifficulty())
                .question(quiz.getQuestion())
                .options(quiz.getOptions())
                .answer(quiz.getAnswer())
                .description(quiz.getDescription())
                .build();
    }
}
