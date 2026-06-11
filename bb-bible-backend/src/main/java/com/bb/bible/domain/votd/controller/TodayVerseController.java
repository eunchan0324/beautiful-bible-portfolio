package com.bb.bible.domain.votd.controller;

import com.bb.bible.domain.votd.dto.TodayVerseResponse;
import com.bb.bible.domain.votd.service.TodayVerseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/today-verse")
@RequiredArgsConstructor
public class TodayVerseController {

    private final TodayVerseService todayVerseService;

    @GetMapping
    public TodayVerseResponse getTodayVerse() {
        return todayVerseService.getTodayVerse();
    }
}
