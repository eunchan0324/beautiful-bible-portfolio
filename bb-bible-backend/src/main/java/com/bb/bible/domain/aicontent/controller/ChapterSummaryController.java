package com.bb.bible.domain.aicontent.controller;

import com.bb.bible.domain.aicontent.dto.ChapterSummaryResponse;
import com.bb.bible.domain.aicontent.service.ChapterSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/bible/books")
@RequiredArgsConstructor
public class ChapterSummaryController {

    private final ChapterSummaryService chapterSummaryService;

    @GetMapping("/{bookCode}/chapters/{chapterNum}/summary")
    public ChapterSummaryResponse getChapterSummary(
        @PathVariable String bookCode,
        @PathVariable Integer chapterNum
    ) {
        return chapterSummaryService.getChapterSummary(bookCode, chapterNum);
    }
}
