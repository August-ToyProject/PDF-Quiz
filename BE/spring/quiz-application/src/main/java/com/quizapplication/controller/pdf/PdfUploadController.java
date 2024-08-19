package com.quizapplication.controller.pdf;

import com.quizapplication.dto.response.PdfUploadResponse;
import com.quizapplication.service.pdf.PdfUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;


@Slf4j
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class PdfUploadController {

    private final PdfUploadService pdfUploadService;

    @PostMapping("/upload")
    public PdfUploadResponse handleFileUpload(@RequestParam("file") MultipartFile file) {
        return pdfUploadService.uploadPdf(file);
    }
}



