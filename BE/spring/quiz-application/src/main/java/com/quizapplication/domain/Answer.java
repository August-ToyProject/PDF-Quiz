package com.quizapplication.domain;

import com.quizapplication.domain.common.BaseTimeEntity;
import com.quizapplication.domain.quiz.Quiz;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

@Getter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Answer extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "answer_id")
    private Long id;

    @OneToOne(mappedBy = "userAnswer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Quiz quiz;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb", nullable = false)
    private String pickedOptions;

    private boolean correct;

    public void updateQuiz(Quiz quiz) {
        this.quiz = quiz;
    }
}
