package com.bb.bible.domain.aicontent.client;

import com.bb.bible.domain.aicontent.entity.ChapterSummaryReviewDecision;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class NoopChapterSummaryReviewClientTest {

    private final NoopChapterSummaryReviewClient reviewClient = new NoopChapterSummaryReviewClient();

    @Test
    void reviewReturnsPassWithoutCallingLlm() {
        ChapterSummaryReviewResponse response = reviewClient.review(
            new ChapterSummaryReviewRequest(
                "창",
                1,
                "하나님이 천지를 창조하시고 세상을 질서 있게 세우시는 장입니다."
            )
        );

        assertThat(response.decision()).isEqualTo(ChapterSummaryReviewDecision.PASS);
        assertThat(response.reason()).isEqualTo("rule validation passed");
        assertThat(response.model()).isEqualTo("none");
    }
}
