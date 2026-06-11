package com.bb.bible.domain.readingplan.dto;

import java.time.LocalDateTime;

public record CompleteReadingChapterResponse(
    Long planId,
    String bookCode,
    Integer chapterNum,
    LocalDateTime completedAt
) {
}
