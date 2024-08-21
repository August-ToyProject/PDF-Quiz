package com.quizapplication.service.pdf;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.quizapplication.dto.request.QuizGenerateRequest;
import com.quizapplication.dto.response.PdfUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface PdfUploadService {
    PdfUploadResponse uploadPdf(MultipartFile file);
    void generateQuiz(QuizGenerateRequest request);
}
