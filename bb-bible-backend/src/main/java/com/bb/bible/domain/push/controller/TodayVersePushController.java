package com.bb.bible.domain.push.controller;

import com.bb.bible.domain.push.service.TodayVersePushService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/push/today-verse")
@RequiredArgsConstructor
public class TodayVersePushController {

    private final TodayVersePushService todayVersePushService;

    @PostMapping("/test")
    public TodayVersePushTestResponse sendTodayVerseForTest() {
        int sentCount = todayVersePushService.sendTodayVerseToAllSubscribers();

        return new TodayVersePushTestResponse(sentCount);
    }

    private record TodayVersePushTestResponse(
        int sentCount
    ) {
    }
}
