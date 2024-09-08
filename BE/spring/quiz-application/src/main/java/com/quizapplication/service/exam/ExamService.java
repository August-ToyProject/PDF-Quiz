package com.quizapplication.service.exam;

import com.quizapplication.dto.request.exam.ExamResultRequest;
import com.quizapplication.dto.response.FolderResponse;
import com.quizapplication.dto.response.exam.ExamResponse;
import com.quizapplication.dto.response.exam.ExamResultResponse;
import java.util.List;

public interface ExamService {
    List<ExamResponse> getExams();
    void deleteExam(Long examId);
    FolderResponse updateExam(Long examId, Long folderId);
    ExamResultResponse saveExam(ExamResultRequest request);
    ExamResultResponse getExam(Long examId);
}
