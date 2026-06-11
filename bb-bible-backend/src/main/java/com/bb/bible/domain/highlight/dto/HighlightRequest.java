package com.bb.bible.domain.highlight.dto;

public record HighlightRequest(
    String verseKey,
    String color,
    String note
) {
}
