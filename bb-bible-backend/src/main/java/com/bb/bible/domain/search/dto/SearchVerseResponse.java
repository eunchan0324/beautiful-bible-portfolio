package com.bb.bible.domain.search.dto;

public record SearchVerseResponse(
    String verseKey,
    String bookCode,
    String bookName,
    Integer chapterNum,
    Integer verseNum,
    String verseText
) {
}
