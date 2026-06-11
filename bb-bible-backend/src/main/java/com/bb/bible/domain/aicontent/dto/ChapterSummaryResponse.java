package com.bb.bible.domain.aicontent.dto;

public record ChapterSummaryResponse(
    String bookCode,
    Integer chapterNum,
    String summary,
    String model
) {
}
