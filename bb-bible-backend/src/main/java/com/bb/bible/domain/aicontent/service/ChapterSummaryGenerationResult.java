package com.bb.bible.domain.aicontent.service;

public record ChapterSummaryGenerationResult(
    String bookCode,
    Integer chapterNum,
    boolean saved,
    String message
) {
    public static ChapterSummaryGenerationResult saved(String bookCode, Integer chapterNum) {
        return new ChapterSummaryGenerationResult(bookCode, chapterNum, true, "saved");
    }

    public static ChapterSummaryGenerationResult skipped(String bookCode, Integer chapterNum, String message) {
        return new ChapterSummaryGenerationResult(bookCode, chapterNum, false, message);
    }
}
