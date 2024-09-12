package com.quizapplication.config.kafka;

import com.quizapplication.config.async.AsyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@Transactional
@RequiredArgsConstructor
public class KafkaConsumer {

    private final AsyncService asyncService;

    @KafkaListener(topics = "quiz_topic")
    public void getQuiz(String kafkaMessage) {
        try {
            log.info("Kafka message: {}", kafkaMessage);
            asyncService.processQuizAsync(kafkaMessage);
        } catch (Exception e) {
            log.error("Error processing Kafka message", e);
        }
    }

}
