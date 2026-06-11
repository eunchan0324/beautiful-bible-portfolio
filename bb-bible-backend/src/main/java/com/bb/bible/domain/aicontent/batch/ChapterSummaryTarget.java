package com.bb.bible.domain.aicontent.batch;

public record ChapterSummaryTarget(
    String bookCode,
    Integer chapterNum
) {
    public static ChapterSummaryTarget parse(String target) {
        String[] parts = target.split(":");
        if (parts.length != 2) {
            throw new IllegalArgumentException("Chapter summary target must use bookCode:chapterNum format");
        }
        return new ChapterSummaryTarget(parts[0], Integer.valueOf(parts[1]));
    }
}
