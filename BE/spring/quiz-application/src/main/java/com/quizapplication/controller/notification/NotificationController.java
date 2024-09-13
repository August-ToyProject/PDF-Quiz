package com.quizapplication.controller.notification;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.quizapplication.service.notification.EmitterService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final EmitterService notificationService;

    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(HttpServletRequest request,
                                @RequestHeader(value = "lastEventId", required = false, defaultValue = "") String lastEventId) throws JsonProcessingException {
        return notificationService.addEmitter(request, lastEventId);
    }

}
