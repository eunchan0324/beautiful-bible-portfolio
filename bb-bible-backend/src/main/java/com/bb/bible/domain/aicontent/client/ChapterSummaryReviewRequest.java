package com.bb.bible.domain.aicontent.client;

public record ChapterSummaryReviewRequest(
    String bookCode,
    Integer chapterNum,
    String summary
) {
}
