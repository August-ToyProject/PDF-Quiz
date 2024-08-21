package com.quizapplication.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
public class QuizGenerateRequest {

    @JsonProperty("index_path")
    private String indexPath;

    @JsonProperty("num_questions")
    private Integer numQuestions;

    @JsonProperty("choice_count")
    private Integer choiceCount;

    private Integer difficulty;
}
