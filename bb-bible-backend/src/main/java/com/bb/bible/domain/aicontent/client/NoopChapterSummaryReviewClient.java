package com.bb.bible.domain.aicontent.client;

import com.bb.bible.domain.aicontent.entity.ChapterSummaryReviewDecision;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "ai.chapter-summary", name = "review-provider", havingValue = "none")
public class NoopChapterSummaryReviewClient implements ChapterSummaryReviewClient {

    @Override
    public ChapterSummaryReviewResponse review(ChapterSummaryReviewRequest request) {
        return new ChapterSummaryReviewResponse(
            ChapterSummaryReviewDecision.PASS,
            "rule validation passed",
            "none"
        );
    }
}
