package com.bb.bible.domain.savedverse.dto;

import java.time.LocalDateTime;

public record SavedVerseResponse(
    String verseKey,
    String bookCode,
    String bookName,
    Integer chapterNum,
    Integer verseNum,
    String verseText,
    LocalDateTime createdAt
) {
}
