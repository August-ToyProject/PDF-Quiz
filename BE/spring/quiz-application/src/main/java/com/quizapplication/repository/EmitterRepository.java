package com.quizapplication.repository;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Slf4j
@Repository
@RequiredArgsConstructor
public class EmitterRepository {

    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    /**
     * 주어진 아이디와 이미터를 저장
     * @param id
     * @param emitter
     */
    public void save(Long id, SseEmitter emitter) {
        emitters.put(id, emitter);
    }

    /**
     * 주어진 아이디로 이미터를 찾아 반환
     * @param id
     */
    public void deleteById(Long id) {
        log.info("deleteById: {}", id);
        emitters.remove(id);
    }

    /**
     * 주어진 아이디로 이미터를 찾아 반환
     * @param id
     */
    public SseEmitter get(Long id) {
        return emitters.get(id);
    }
}
