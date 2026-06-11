package com.bb.bible.domain.votd.dto;

public record TodayVerseResponse(
    String verseKey,
    String bookCode,
    Integer chapterNum,
    Integer verseNum,
    String verseText,
    String theme
) {
}
