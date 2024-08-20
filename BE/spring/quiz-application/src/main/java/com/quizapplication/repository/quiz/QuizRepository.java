package com.quizapplication.repository.quiz;

import com.quizapplication.domain.quiz.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
}
