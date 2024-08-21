package com.quizapplication.service.pdf;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizapplication.config.security.SecurityUtil;
import com.quizapplication.domain.Member;
import com.quizapplication.domain.pdf.Pdf;
import com.quizapplication.dto.request.PythonQuizRequest;
import com.quizapplication.dto.request.QuizGenerateRequest;
import com.quizapplication.dto.response.PdfUploadResponse;
import com.quizapplication.repository.MemberRepository;
import com.quizapplication.repository.pdf.PdfRepository;
import java.net.URI;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

@Slf4j
@Service
@RequiredArgsConstructor
public class PdfUploadServiceImpl implements PdfUploadService {

    @Value("${python.url}")
    private String pythonServerUrl;

    @Value("${python.quiz_url}")
    private String pythonQuizUrl;

    private final PdfRepository pdfRepository;
    private final MemberRepository memberRepository;

    @Override
    @SneakyThrows
    @Transactional
    public PdfUploadResponse uploadPdf(MultipartFile file) {

        RestTemplate restTemplate = new RestTemplate();

        URI uri = UriComponentsBuilder.fromHttpUrl(pythonServerUrl).build().toUri();

        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("file", file.getResource(), MediaType.APPLICATION_OCTET_STREAM);

        HttpEntity<?> requestEntity = new HttpEntity<>(builder.build(), headers);

        ResponseEntity<String> response = restTemplate.exchange(
                uri,
                HttpMethod.POST,
                requestEntity,
                String.class
        );

        ObjectMapper objectMapper = new ObjectMapper();
        Map<String, Object> responseBody = objectMapper.readValue(response.getBody(),
                new TypeReference<Map<String, Object>>() {});

        String indexPath = (String) responseBody.get("index_path");

        Member member = memberRepository.findByEmail(SecurityUtil.getCurrentMemberEmail());

        Pdf pdf = Pdf.builder()
                .member(member)
                .indexPath(indexPath)
                .build();

        member.addPdf(pdf);

        return PdfUploadResponse.of(pdfRepository.save(pdf));
    }

    @Override
    public void generateQuiz(QuizGenerateRequest request) {
        RestTemplate restTemplate = new RestTemplate();

        URI uri = UriComponentsBuilder.fromHttpUrl(pythonQuizUrl).build().toUri();
        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(MediaType.APPLICATION_JSON);

        PythonQuizRequest pythonQuizRequest = PythonQuizRequest.of(SecurityUtil.getCurrentMemberEmail(), request);

        ResponseEntity<String> response = restTemplate.exchange(
                uri,
                HttpMethod.POST,
                new HttpEntity<>(pythonQuizRequest, headers),
                String.class
        );
        log.info("member={}", SecurityUtil.getCurrentMemberEmail());
        log.info("response={}", response);
    }
}
