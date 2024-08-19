package com.quizapplication.dto.response;

import com.quizapplication.domain.pdf.Pdf;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PdfUploadResponse {

    private String indexPath;

    public static PdfUploadResponse of(Pdf pdf) {
        return new PdfUploadResponse(pdf.getIndexPath());
    }

}
