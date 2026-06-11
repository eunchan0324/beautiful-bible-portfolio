package com.bb.bible.domain.readingplan.dto;

import java.time.LocalDateTime;

public record ReadingProgressResponse(
    String bookCode,
    Integer chapterNum,
    LocalDateTime completedAt
) {
}
