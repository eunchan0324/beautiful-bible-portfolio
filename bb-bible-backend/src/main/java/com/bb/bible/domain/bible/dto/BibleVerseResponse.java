package com.bb.bible.domain.bible.dto;

public record BibleVerseResponse(
    Integer verseNum,
    String verseText,
    String verseKey
) {
}
