package com.quizapplication.repository.exam;

import com.quizapplication.domain.exam.Exam;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByMemberId(Long memberId);
}
