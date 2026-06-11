package com.bb.bible.domain.aicontent.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ChapterSummaryTextNormalizerTest {

    @Test
    void normalizeAddsPeriodWhenSummaryEndsWithAllowedEndingWithoutPeriod() {
        String summary = "하나님이 에덴 동산을 지으시며 사람을 지으신 것으로 나타냅니다";

        String normalized = ChapterSummaryTextNormalizer.normalize(summary);

        assertThat(normalized).isEqualTo("하나님이 에덴 동산을 지으시며 사람을 지으신 것으로 나타냅니다.");
    }

    @Test
    void normalizeTrimsSummary() {
        String normalized = ChapterSummaryTextNormalizer.normalize(" 하나님이 에덴 동산을 지으시는 장입니다. ");

        assertThat(normalized).isEqualTo("하나님이 에덴 동산을 지으시는 장입니다.");
    }

    @Test
    void normalizeDoesNotAddPeriodForUnsupportedEnding() {
        String summary = "하나님이 에덴 동산을 지으시니라";

        String normalized = ChapterSummaryTextNormalizer.normalize(summary);

        assertThat(normalized).isEqualTo("하나님이 에덴 동산을 지으시니라");
    }
}
