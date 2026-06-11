package com.bb.bible.domain.aicontent.client;

import com.bb.bible.domain.aicontent.entity.ChapterSummaryReviewDecision;

public record ChapterSummaryReviewResponse(
    ChapterSummaryReviewDecision decision,
    String reason,
    String model
) {
}
