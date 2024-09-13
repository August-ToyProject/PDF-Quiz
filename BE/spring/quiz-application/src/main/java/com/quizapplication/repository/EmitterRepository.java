package com.quizapplication.repository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Slf4j
@Repository
@RequiredArgsConstructor
public class EmitterRepository {

    /**
     * 사용자 아이디와 이미터 객체를 저장하는 저장소
     */
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    /**
     * 알림이 사용자에게 전달이 되지 못했을 때 이벤트 유실을 방지하기 위해 신뢰성을 보장하고자 해당 저장소를 추가
     */
    private final Map<String, Object> eventCache = new ConcurrentHashMap<>();


    /**
     * 주어진 아이디와 이미터를 저장
     * @param id
     * @param emitter
     */
    public SseEmitter save(String id, SseEmitter emitter) {
        emitters.put(id, emitter);
        return emitter;
    }

    /**
     * 이벤트 캐시 저장소에 이벤트를 저장
     * @param emitterId
     * @param event
     */
    public void saveEventCache(String emitterId, Object event) {
        eventCache.put(emitterId, event);
    }

    public Map<String, SseEmitter> findAllEmitters() {
        return new HashMap<>(emitters);
    }

    /**
     * 주어진 아이디로 이미터를 찾아 반환
     * @param id
     */
    public void deleteById(String id) {
        log.info("deleteById: {}", id);
        emitters.remove(id);
    }

    /**
     * 주어진 아이디로 이미터를 찾아 반환
     * @param id
     */
    public SseEmitter get(String id) {
        return emitters.get(id);
    }

    public Map<String, SseEmitter> findAllEmitterStartWithById(String memberId) {
        return emitters.entrySet().stream()
                .filter(entry -> entry.getKey().startsWith(String.valueOf(memberId)))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    public Map<String, Object> findAllEventCacheStartWithById(String memberId) {
        return eventCache.entrySet().stream()
                .filter(entry -> entry.getKey().startsWith(String.valueOf(memberId)))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }
}
