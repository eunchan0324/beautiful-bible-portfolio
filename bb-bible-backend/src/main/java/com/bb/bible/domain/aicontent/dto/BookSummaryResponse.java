package com.bb.bible.domain.aicontent.dto;

import java.util.List;

public record BookSummaryResponse(
    String bookCode,
    String shortSummary,
    String summary,
    String readingPoint,
    List<String> keywords,
    List<String> outline,
    String model
) {
}
