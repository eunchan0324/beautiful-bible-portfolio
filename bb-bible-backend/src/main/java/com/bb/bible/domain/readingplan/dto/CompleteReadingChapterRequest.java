package com.bb.bible.domain.readingplan.dto;

public record CompleteReadingChapterRequest(
    String bookCode,
    Integer chapterNum
) {
}
