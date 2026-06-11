package com.bb.bible.domain.readingplan.dto;

public record ReadingPlanItemResponse(
    Integer dayNumber,
    String bookCode,
    Integer chapterNum,
    Integer itemOrder
) {
}
