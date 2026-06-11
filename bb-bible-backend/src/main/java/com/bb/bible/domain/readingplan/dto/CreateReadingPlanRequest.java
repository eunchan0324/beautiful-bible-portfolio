package com.bb.bible.domain.readingplan.dto;

import java.time.LocalDate;
import java.util.List;

public record CreateReadingPlanRequest(
    String title,
    List<String> bookCodes,
    Integer dailyChapterTarget,
    LocalDate startDate
) {
}
