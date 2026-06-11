package com.bb.bible.domain.aicontent.client;

public record ChapterSummaryAiRequest(
    String bookCode,
    String bookName,
    Integer chapterNum,
    String chapterText,
    String retryReason
) {
    public ChapterSummaryAiRequest(String bookCode, String bookName, Integer chapterNum, String chapterText) {
        this(bookCode, bookName, chapterNum, chapterText, null);
    }
}
