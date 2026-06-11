package com.bb.bible.domain.readingplan.dto;

import com.bb.bible.domain.readingplan.entity.ReadingPlanStatus;

import java.time.LocalDate;
import java.util.List;

public record ReadingPlanResponse(
    Long id,
    String title,
    LocalDate startDate,
    Integer dailyChapterTarget,
    ReadingPlanStatus status,
    List<ReadingPlanItemResponse> items,
    List<ReadingProgressResponse> completedChapters
) {
}
