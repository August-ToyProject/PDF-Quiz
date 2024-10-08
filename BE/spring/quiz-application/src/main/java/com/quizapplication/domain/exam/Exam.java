package com.quizapplication.domain.exam;

import com.quizapplication.domain.Member;
import com.quizapplication.domain.common.BaseTimeEntity;
import com.quizapplication.domain.folder.Folder;
import com.quizapplication.domain.pdf.Pdf;
import com.quizapplication.domain.quiz.Quiz;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Exam extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "exam_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id")
    private Folder folder;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pdf_id")
    private Pdf pdf;

    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL)
    private List<Quiz> quizzes = new ArrayList<>();

    private String title;

    @Convert(converter = DurationConverter.class)
    private Duration setTime;

    @Convert(converter = DurationConverter.class)
    private Duration spentTime;

    public void updateFolder(Folder folder) {
        this.folder = folder;
    }

    public void addQuiz(Quiz quiz) {
        quizzes.add(quiz);
        quiz.updateExam(this);
    }
}
