package com.bb.bible.domain.readingplan.dto;

import com.bb.bible.domain.readingplan.entity.ReadingPlanStatus;

import java.time.LocalDate;

public record CreateReadingPlanResponse(
    Long id,
    String title,
    LocalDate startDate,
    Integer dailyChapterTarget,
    ReadingPlanStatus status
) {
}
