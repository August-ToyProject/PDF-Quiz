package com.quizapplication.repository.pdf;

import com.quizapplication.domain.pdf.Pdf;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PdfRepository extends JpaRepository<Pdf, Long> {
}
