package com.quizapplication.controller.exam;

import com.quizapplication.dto.response.exam.ExamResponse;
import com.quizapplication.service.exam.ExamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "시험 관련 API 명세")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class ExamController {

    private final ExamService examService;

    @Operation(summary = "시험 목록 조회", description = "현재 로그인한 사용자의 시험 목록을 조회")
    @GetMapping("/exams-main")
    public ResponseEntity<List<ExamResponse>> getExams() {
        return ResponseEntity.ok().body(examService.getExams());
    }
}
