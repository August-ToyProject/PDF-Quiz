package com.quizapplication.config.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizapplication.domain.quiz.Quiz;
import com.quizapplication.dto.response.quiz.QuizResponse;
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

@Service
@Slf4j
@RequiredArgsConstructor
public class KafkaConsumer {

    private final QuizRepository quizRepository;
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
    private void parseQuiz(String kafkaMessage) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(kafkaMessage);

        List<Map<String, Object>> resultList = new ArrayList<>();

        for (int i = 0; i < 5; i++) {
            resultList.add(new LinkedHashMap<>());
        }

        // "question" 키의 값을 가져옴
        String questionBlock = rootNode.get("question").asText();
        String[] strings = questionBlock.split("\n");

        Map<Integer, String> options = new LinkedHashMap<>();

        int idx = -1;

        for (String string : strings) {
            if (string.startsWith("난이도:")) {
                idx++;
                options = new LinkedHashMap<>();
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
                resultList.get(idx).put("answer", answer +" "+options.get(answer));
            }

            if (string.startsWith("설명:")) {
                String description = string.substring("설명:".length()).trim();
                resultList.get(idx).put("description", description);
                resultList.get(idx).put("options", options);
            }

        }


        for (Map<String, Object> map : resultList) {

            String optionsJson = objectMapper.writeValueAsString(map.get("options"));

            Quiz quiz = Quiz.builder()
                .difficulty((String) map.get("difficulty"))
                .question((String) map.get("question"))
                .answer((String) map.get("answer"))
                .description((String) map.get("description"))
                .options(optionsJson)
                .build();
            Quiz savedQuiz = quizRepository.save(quiz);
            notificationService.notify(1L, QuizResponse.of(savedQuiz));
        }
    }
}
