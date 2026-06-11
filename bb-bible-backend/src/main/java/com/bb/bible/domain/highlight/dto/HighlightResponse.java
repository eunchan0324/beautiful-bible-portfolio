package com.bb.bible.domain.highlight.dto;

import com.bb.bible.domain.highlight.entity.Highlight;

import java.time.LocalDateTime;

public record HighlightResponse(
    Long id,
    String verseKey,
    String color,
    String note,
    LocalDateTime createdAt
) {
    public static HighlightResponse from(Highlight highlight) {
        return new HighlightResponse(
            highlight.getId(),
            highlight.getVerseKey(),
            highlight.getColor(),
            highlight.getNote(),
            highlight.getCreatedAt()
        );
    }
}
