package com.quizapplication.service.exam;

import com.quizapplication.dto.response.exam.ExamResponse;
import java.util.List;

public interface ExamService {
    List<ExamResponse> getExams();
    void deleteExam(Long examId);
}
