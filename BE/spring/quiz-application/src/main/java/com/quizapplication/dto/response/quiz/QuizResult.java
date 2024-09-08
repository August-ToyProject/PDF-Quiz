package com.quizapplication.dto.response.quiz;

import lombok.Getter;

@Getter
public class QuizResult {
    private Long quizId;
    private String answer;
    private boolean isCorrect;
}
