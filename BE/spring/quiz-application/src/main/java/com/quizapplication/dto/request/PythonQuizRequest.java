package com.quizapplication.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class PythonQuizRequest {

    private String email;

    @JsonProperty("index_path")
    private String indexPath;

    @JsonProperty("num_questions")
    private Integer numQuestions;

    @JsonProperty("choice_count")
    private Integer choiceCount;

    private Integer difficulty;

    public static PythonQuizRequest of(String email, QuizGenerateRequest request) {
        return PythonQuizRequest.builder()
                .email(email)
                .indexPath(request.getIndexPath())
                .numQuestions(request.getNumQuestions())
                .choiceCount(request.getChoiceCount())
                .difficulty(request.getDifficulty())
                .build();
    }


}
