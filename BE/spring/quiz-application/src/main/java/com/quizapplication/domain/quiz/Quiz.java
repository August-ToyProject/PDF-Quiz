package com.quizapplication.domain.quiz;

import com.quizapplication.domain.Answer;
import com.quizapplication.domain.Member;
import com.quizapplication.domain.common.BaseTimeEntity;
import com.quizapplication.domain.exam.Exam;
import com.quizapplication.domain.pdf.Pdf;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
public class Quiz extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quiz_id")
    private Long id;

    private String difficulty;

    private String question;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb", nullable = false)
    private String options;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb", nullable = false)
    private String answer;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pdf_id")
    private Pdf pdf;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "answer_id")
    private Answer userAnswer;

    public void updateMember(Member member) {
        this.member = member;
    }

    public void updatePdf(Pdf pdf) {
        this.pdf = pdf;
    }

}
