package com.quizapplication.config.async;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizapplication.domain.Member;
import com.quizapplication.domain.pdf.Pdf;
import com.quizapplication.domain.quiz.Quiz;
import com.quizapplication.dto.response.quiz.QuizResponse;
import com.quizapplication.repository.EmitterRepository;
import com.quizapplication.repository.MemberRepository;
import com.quizapplication.repository.pdf.PdfRepository;
import com.quizapplication.repository.quiz.QuizRepository;
import com.quizapplication.service.notification.EmitterService;
import com.quizapplication.service.notification.NotificationService;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AsyncService {
    private final QuizRepository quizRepository;
    private final PdfRepository pdfRepository;
    private final MemberRepository memberRepository;
    private final EmitterService emitterService;
    private final EmitterRepository emitterRepository;

    @Async
    public CompletableFuture<Void>  processQuizAsync(String kafkaMessage) {
        try {
            // 비동기적으로 처리할 로직
            parseQuiz(kafkaMessage);
        } catch (Exception e) {
            log.error("Error processing Kafka message in async method", e);
        }
        return CompletableFuture.completedFuture(null);
    }

//    @Async
//    public void  processQuizAsync(String kafkaMessage) {:
//        try {
//            // 비동기적으로 처리할 로직
//            parseQuiz(kafkaMessage);
//        } catch (Exception e) {
//            log.error("Error processing Kafka message in async method", e);
//        }
////        return CompletableFuture.completedFuture(null);
//    }

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

        List<Quiz> quizList = new ArrayList<>();


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
            member.addQuiz(quiz);
            pdf.addQuiz(quiz);
            Quiz savedQuiz = quizRepository.save(quiz);
            quizList.add(savedQuiz);
        }
        List<QuizResponse> result = quizList.stream().map(QuizResponse::of).toList();
        sleep(1000);

        Map<String, SseEmitter> sseEmitters = emitterRepository.findAllEmitterStartWithById(String.valueOf(member.getId()));
        String eventId = member.getId() + "_" + System.nanoTime();
        log.info("Saving event to cache with key: {}", eventId);
        sseEmitters.forEach((key, emitter) -> {
            emitterRepository.saveEventCache(key, result);
            emitterService.sendToClient(emitter, eventId, result);
        });

    }

    private void sleep(int millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
