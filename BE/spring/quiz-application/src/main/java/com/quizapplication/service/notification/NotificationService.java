package com.quizapplication.service.notification;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizapplication.repository.EmitterRepository;
import java.io.IOException;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final EmitterRepository emitterRepository;

    private static final Long DEFAULT_TIMEOUT = 60L * 1000 * 60;

    /**
     * 클라이언트를 구독
     * @param userId - 구독할 사용자의 아이디
     * @return SseEmitter - 서버에서 보낸 이벤트 Emitter
     */
    public SseEmitter subscribe(Long userId) throws JsonProcessingException {
        SseEmitter emitter = createEmitter(userId);
        sendToClient(userId, "EventStream Created. [userId=" + userId + "]");
        return emitter;
    }

    /**
     * 서버의 이벤트를 클라이언트에게 보내는 메소드
     * 다른 서비스 로직에서 이 메소드를 사용해 데이터를 Object evnet에 넣고 전송하면 된다.
     */
    public void notify(Long userId, Object event) throws JsonProcessingException {
        sendToClient(userId, event);
    }


    /**
     * 클라이언트에게 데이터를 전송
     * @param id - 데이터를 받을 사용자의 아이디
     * @param data - 전송할 데이터
     */
     private void sendToClient(Long id, Object data) throws JsonProcessingException {
         SseEmitter emitter = emitterRepository.get(id);
         String jsonData = new ObjectMapper().writeValueAsString(new Notification("한글", "bc"));
         log.info("Send to client. [userId={}, data={}]", id, data);
         if (emitter != null) {
             try {
                 emitter.send(SseEmitter.event().id(String.valueOf(id)).name("sse").data(data));
             } catch (IOException e) {
                 emitterRepository.deleteById(id);
                 emitter.completeWithError(e);
             }
         }
     }

     @Getter
     @AllArgsConstructor
     static class Notification {
         private String message;
         private String data;
     }


    /**
     * 사용자 아이디를 기반으로 이벤트 Emitter 생성
     * @param id - 사용자 아이디
     * @return SseEmitter - 생선된 이벤트 Emitter
     */

    private SseEmitter createEmitter(Long id) {
        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);
        emitterRepository.save(id, emitter);
        log.info("Emitter created. [userId={}]", id);
        // Emitter가 완료될 때(모든 데이터가 성공적으로 전송된 상태) Emitter를 삭제한다.
        emitter.onCompletion(() -> emitterRepository.deleteById(id));
        // Emitter가 타임아웃 되었을 때(지정된 시간동안 어떠한 이벤트도 전송되지 않았을 때) Emitter를 삭제한다.
        emitter.onTimeout(() -> emitterRepository.deleteById(id));
        return emitter;
    }

}
