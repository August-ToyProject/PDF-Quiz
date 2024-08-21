package com.quizapplication.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.quizapplication.domain.Member;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class PythonQuizRequest {

    @JsonProperty("user_idx")
    private Long userId;

    private String email;

    @JsonProperty("index_path")
    private String indexPath;

    @JsonProperty("num_questions")
    private Integer numQuestions;

    @JsonProperty("choice_count")
    private Integer choiceCount;

    private Integer difficulty;

    public static PythonQuizRequest of(Member member, QuizGenerateRequest request) {
        return PythonQuizRequest.builder()
                .userId(member.getId())
                .email(member.getEmail())
                .indexPath(request.getIndexPath())
                .numQuestions(request.getNumQuestions())
                .choiceCount(request.getChoiceCount())
                .difficulty(request.getDifficulty())
                .build();
    }


}
