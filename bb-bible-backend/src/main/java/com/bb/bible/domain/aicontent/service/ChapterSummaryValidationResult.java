package com.bb.bible.domain.aicontent.service;

public record ChapterSummaryValidationResult(
    boolean valid,
    String message
) {
    public static ChapterSummaryValidationResult accepted() {
        return new ChapterSummaryValidationResult(true, "valid");
    }

    public static ChapterSummaryValidationResult rejected(String message) {
        return new ChapterSummaryValidationResult(false, message);
    }
}
