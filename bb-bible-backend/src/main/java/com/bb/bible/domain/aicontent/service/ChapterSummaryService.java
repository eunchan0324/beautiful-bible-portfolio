package com.bb.bible.domain.aicontent.service;

import com.bb.bible.domain.aicontent.dto.ChapterSummaryResponse;
import com.bb.bible.domain.aicontent.entity.ChapterSummary;
import com.bb.bible.domain.aicontent.repository.ChapterSummaryRepository;
import com.bb.bible.global.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChapterSummaryService {

    private final ChapterSummaryRepository chapterSummaryRepository;

    public ChapterSummaryResponse getChapterSummary(String bookCode, Integer chapterNum) {
        ChapterSummary chapterSummary = chapterSummaryRepository
            .findByBookCodeAndChapterNum(bookCode, chapterNum)
            .orElseThrow(() -> new NotFoundException("Chapter summary not found"));

        return new ChapterSummaryResponse(
            chapterSummary.getBookCode(),
            chapterSummary.getChapterNum(),
            chapterSummary.getSummary(),
            chapterSummary.getModel()
        );
    }
}
