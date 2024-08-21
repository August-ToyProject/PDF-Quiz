package com.quizapplication.dto.response.quiz;

import com.quizapplication.domain.quiz.Quiz;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class QuizResponse {

    private String difficulty;

    private String question;

    private String options;

    private String answer;

    private String description;

    public static QuizResponse of(Quiz quiz) {
        return QuizResponse.builder()
                .difficulty(quiz.getDifficulty())
                .question(quiz.getQuestion())
                .options(quiz.getOptions())
                .answer(quiz.getAnswer())
                .description(quiz.getDescription())
                .build();
    }
}
