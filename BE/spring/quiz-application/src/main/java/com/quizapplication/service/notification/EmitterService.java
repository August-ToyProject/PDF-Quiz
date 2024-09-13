package com.quizapplication.service.notification;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.quizapplication.config.jwt.TokenProvider;
import com.quizapplication.repository.EmitterRepository;
import com.quizapplication.repository.MemberRepository;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmitterService {

    private final EmitterRepository emitterRepository;
    private final TokenProvider tokenProvider;
    private final MemberRepository memberRepository;

    private static final Long DEFAULT_TIMEOUT = 1200000L;

//    /**
//     * 서버의 이벤트를 클라이언트에게 보내는 메소드
//     * 다른 서비스 로직에서 이 메소드를 사용해 데이터를 Object evnet에 넣고 전송하면 된다.
//     */
//    public void notify(String userId, List<QuizResponse> event) throws JsonProcessingException {
//        sendToClient(userId, event);
//    }


    /**
     * 클라이언트에게 데이터를 전송
     * @param emitter - 데이터를 받을 사용자의 이벤트 Emitter
     * @param emitterId - 데이터를 받을 사용자의 아이디
     * @param data - 전송할 데이터
     */
    public void sendToClient(SseEmitter emitter, String emitterId, Object data) {
        try {
            emitter.send(SseEmitter.event()
                    .id(emitterId)
                    .name("sse")
                    .data(data));
            log.info("Kafka로 부터 전달 받은 메세지 전송. emitterId : {}, message : {}", emitterId, data);
        } catch (IOException e) {
            emitterRepository.deleteById(emitterId);
            log.error("메시지 전송 에러 : {}", e);
        }
    }

     @Getter
     @AllArgsConstructor
     static class Notification {
         private String message;
         private String data;
     }


//    /**
//     * 사용자 아이디를 기반으로 이벤트 Emitter 생성
//     * @param id - 사용자 아이디
//     * @return SseEmitter - 생선된 이벤트 Emitter
//     */

//    private SseEmitter createEmitter(String id) {
//        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);
//        emitterRepository.save(id, emitter);
//        log.info("Emitter created. [userId={}]", id);
//        // Emitter가 완료될 때(모든 데이터가 성공적으로 전송된 상태) Emitter를 삭제한다.
//        emitter.onCompletion(() -> emitterRepository.deleteById(id));
//        // Emitter가 타임아웃 되었을 때(지정된 시간동안 어떠한 이벤트도 전송되지 않았을 때) Emitter를 삭제한다.
//        emitter.onTimeout(() -> emitterRepository.deleteById(id));
//        return emitter;
//    }


//    @Scheduled(fixedRate = 180000) // 3분마다 heartbeat 메세지 전달.
//    public void sendHeartbeat() {
//        Map<String, SseEmitter> sseEmitters = emitterRepository.findAllEmitters();
//        sseEmitters.forEach((key, emitter) -> {
//            try {
//                emitter.send(SseEmitter.event().id(String.valueOf(key)).name("heartbeat").data(""));
//                log.info("하트비트 메세지 전송");
//            } catch (IOException e) {
//                emitterRepository.deleteById(key);
//                log.error("하트비트 전송 실패: {}", e.getMessage());
//            }
//        });
//    }

    public SseEmitter addEmitter(HttpServletRequest request, String lastEventId) {
        String accessToken = tokenProvider.getAccessToken(request);
        String email = tokenProvider.getClaims(accessToken).getSubject();
        String userId = String.valueOf(memberRepository.findByEmail(email).getId());
        String emitterId = userId + "_" + System.nanoTime();
        SseEmitter emitter = emitterRepository.save(emitterId, new SseEmitter(DEFAULT_TIMEOUT));

        log.info("emitterId : {} 사용자 emitter 연결 ", emitterId);

        emitter.onCompletion(() -> {
            log.info("onCompletion callback");
            emitterRepository.deleteById(emitterId);
        });
        emitter.onTimeout(() -> {
            log.info("onTimeout callback");
            emitterRepository.deleteById(emitterId);
        });

        Connect connect = new Connect("connected!");

        sendToClient(emitter, emitterId, connect); // 503 에러방지 더미 데이터

        if (hasLostData(lastEventId)) {
            Map<String, Object> events = emitterRepository.findAllEventCacheStartWithById(userId);
            log.info("sendLostData: {}", events);
            events.entrySet().stream()
                    .filter(entry -> lastEventId.compareTo(entry.getKey()) < 0)
                    .forEach(entry -> sendToClient(emitter, entry.getKey(), entry.getValue()));
        }

        return emitter;
    }

    @Setter @Getter
    @AllArgsConstructor
    static class Connect {
        private String data;
    }
//    /**
//     * 유실 데이터 전송
//     * @param lastEventId
//     * @param userId
//     */
//    private void sendLostData(String lastEventId, String userId) {
//        Map<String, Object> events = emitterRepository.findAllEventCacheStartWithById(userId);
//        log.info("sendLostData: {}", events);
//        events.entrySet().stream()
//                .filter(entry -> lastEventId.compareTo(entry.getKey()) < 0)
//                .forEach(entry -> sendToClient(, entry.getKey(), entry.getValue()));
//    }


    /**
     * 마지막 이벤트 ID를 기반으로 구독자가 받지 못한 데이터가 있는지 확인
     * @param lastEventId
     * @return
     */
    private boolean hasLostData(String lastEventId) {
        return !lastEventId.isEmpty();
    }

}
