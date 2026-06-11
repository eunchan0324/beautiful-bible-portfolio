package com.bb.bible.domain.push.controller;

import com.bb.bible.domain.push.config.PushSchedulerProperties;
import com.bb.bible.domain.push.service.TodayVersePushService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/internal/push/today-verse")
@RequiredArgsConstructor
public class TodayVersePushSchedulerController {

    private static final String SCHEDULER_SECRET_HEADER = "X-Scheduler-Secret";

    private final TodayVersePushService todayVersePushService;
    private final PushSchedulerProperties pushSchedulerProperties;

    @PostMapping
    public ResponseEntity<TodayVersePushSchedulerResponse> sendTodayVerse(
        @RequestHeader(value = SCHEDULER_SECRET_HEADER, required = false) String schedulerSecret
    ) {
        if (!pushSchedulerProperties.matches(schedulerSecret)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        int sentCount = todayVersePushService.sendTodayVerseToAllSubscribers();

        return ResponseEntity.ok(new TodayVersePushSchedulerResponse(sentCount));
    }

    private record TodayVersePushSchedulerResponse(
        int sentCount
    ) {
    }
}
