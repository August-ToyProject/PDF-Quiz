package com.quizapplication.config.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizapplication.config.security.SecurityUtil;
import com.quizapplication.domain.Member;
import com.quizapplication.domain.pdf.Pdf;
import com.quizapplication.domain.quiz.Quiz;
import com.quizapplication.dto.response.quiz.QuizResponse;
import com.quizapplication.repository.MemberRepository;
import com.quizapplication.repository.pdf.PdfRepository;
import com.quizapplication.repository.quiz.QuizRepository;
import com.quizapplication.service.notification.NotificationService;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@Transactional
@RequiredArgsConstructor
public class KafkaConsumer {

    private final QuizRepository quizRepository;
    private final PdfRepository pdfRepository;
    private final MemberRepository memberRepository;
    private final NotificationService notificationService;

    @KafkaListener(topics = "quiz_topic")
    public void getQuiz(String kafkaMessage) {
        try {
            parseQuiz(kafkaMessage);
        } catch (Exception e) {
            log.error("Error processing Kafka message", e);
        }
    }

    // 문제 처리
    public void parseQuiz(String kafkaMessage) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(kafkaMessage);

        List<Map<String, Object>> resultList = new ArrayList<>();

        for (int i = 0; i < 5; i++) {
            resultList.add(new LinkedHashMap<>());
        }

        // "question" 키의 값을 가져옴
        String questionBlock = rootNode.get("question").asText();
        String email = rootNode.get("email").asText();
        String indexPath = rootNode.get("index_path").asText();

        Member member = memberRepository.findByEmail(email);
        Pdf pdf = pdfRepository.findByIndexPath(indexPath);

        String[] strings = questionBlock.split("\n");

        Map<Integer, String> options = new LinkedHashMap<>();
        Map<Integer, String> answerMap = new LinkedHashMap<>();

        int idx = -1;

        for (String string : strings) {
            if (string.startsWith("난이도:")) {
                idx++;
                options = new LinkedHashMap<>();
                answerMap = new LinkedHashMap<>();
                String difficulty = string.substring("난이도:".length()).trim();
                resultList.get(idx).put("difficulty", difficulty);
            }

            if (string.startsWith("문제:")) {
                String question = string.substring("문제:".length()).trim();
                resultList.get(idx).put("question", question);
            }

            if (string.startsWith("1)") || string.startsWith("2)") || string.startsWith("3)") || string.startsWith("4)")
                || string.startsWith("5)") || string.startsWith("6)")){
                int choiceNumber = Integer.parseInt(string.substring(0, 1));
                String choice = string.substring(2).trim();
                options.put(choiceNumber, choice);
            }

            if (string.startsWith("정답:")) {
                int answer = Integer.parseInt(string.substring("정답:".length()).trim());
                answerMap.put(answer, options.get(answer));
                resultList.get(idx).put("answer", answerMap);
            }

            if (string.startsWith("설명:")) {
                String description = string.substring("설명:".length()).trim();
                resultList.get(idx).put("description", description);
                resultList.get(idx).put("options", options);
            }

        }

        for (Map<String, Object> map : resultList) {

            String optionsJson = objectMapper.writeValueAsString(map.get("options"));
            String answerJson = objectMapper.writeValueAsString(map.get("answer"));

            Quiz quiz = Quiz.builder()
                .difficulty((String) map.get("difficulty"))
                .question((String) map.get("question"))
                .answer(answerJson)
                .description((String) map.get("description"))
                .options(optionsJson)
                .member(member)
                .pdf(pdf)
                .build();
            Quiz saveQuiz = quizRepository.save(quiz);
            member.addQuiz(saveQuiz);
            pdf.addQuiz(saveQuiz);
            notificationService.notify(member.getId(), QuizResponse.of(quiz));
        }
    }
}
