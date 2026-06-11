package com.bb.bible.domain.aicontent.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ChapterSummaryValidationServiceTest {

    private final ChapterSummaryValidationService validationService = new ChapterSummaryValidationService();

    @Test
    void validateReturnsValidForAcceptedSummary() {
        ChapterSummaryValidationResult result = validationService.validate(
            "하나님이 천지를 창조하시고 빛과 궁창과 생명과 시간을 질서 있게 세우시는 장입니다."
        );

        assertThat(result.valid()).isTrue();
    }

    @Test
    void validateAcceptsPromptAllowedEndings() {
        assertThat(validationService.validate(
            "새 하늘과 새 땅에서 하나님이 함께하시며 모든 고통이 사라지는 회복을 묘사합니다."
        ).valid()).isTrue();
        assertThat(validationService.validate(
            "목자이신 여호와의 인도와 보호, 선하심과 인자하심 안에 머무는 깊은 신뢰를 전합니다."
        ).valid()).isTrue();
        assertThat(validationService.validate(
            "하나님이 에덴 동산을 창설하시며 아담과 그의 아내를 지으시는 창조 과정을 나타냅니다."
        ).valid()).isTrue();
    }

    @Test
    void validateRejectsForbiddenStart() {
        ChapterSummaryValidationResult result = validationService.validate(
            "이 장은 하나님이 천지를 창조하시고 빛과 궁창과 생명과 시간을 질서 있게 세우시는 장입니다."
        );

        assertThat(result.valid()).isFalse();
        assertThat(result.message()).isEqualTo("summary starts with a forbidden phrase");
    }

    @Test
    void validateRejectsForbiddenKeyword() {
        ChapterSummaryValidationResult result = validationService.validate(
            "하나님이 천지를 창조하시고 우리에게 세상의 질서와 생명의 시작을 보여 주시는 장입니다."
        );

        assertThat(result.valid()).isFalse();
        assertThat(result.message()).isEqualTo("summary contains a forbidden keyword");
    }

    @Test
    void validateRejectsTooShortSummary() {
        ChapterSummaryValidationResult result = validationService.validate("하나님이 천지를 창조하시는 장입니다.");

        assertThat(result.valid()).isFalse();
        assertThat(result.message()).isEqualTo("summary length must be between 40 and 120 characters");
    }
}
