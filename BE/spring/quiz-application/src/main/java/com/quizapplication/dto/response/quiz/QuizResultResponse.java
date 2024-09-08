package com.quizapplication.dto.response.quiz;

import com.quizapplication.domain.Answer;
import com.quizapplication.domain.quiz.Quiz;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class QuizResultResponse {

    private Long quizId;

    private String difficulty;

    private String question;

    private String options;

    private String answer;

    private String description;

    private String userAnswer;

    public static QuizResultResponse of(Quiz quiz, Answer answer) {
        return QuizResultResponse.builder()
                .quizId(quiz.getId())
                .difficulty(quiz.getDifficulty())
                .question(quiz.getQuestion())
                .options(quiz.getOptions())
                .answer(quiz.getAnswer())
                .description(quiz.getDescription())
                .userAnswer(answer.getPickedOptions())
                .build();
    }
}
