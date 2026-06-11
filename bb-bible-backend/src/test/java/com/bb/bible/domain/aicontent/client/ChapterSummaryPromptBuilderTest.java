package com.bb.bible.domain.aicontent.client;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ChapterSummaryPromptBuilderTest {

    @Test
    void buildIncludesStrictEndingAndLengthRules() {
        String prompt = ChapterSummaryPromptBuilder.build(new ChapterSummaryAiRequest(
            "창",
            "창세기",
            2,
            "1 샘플 본문입니다."
        ));

        assertThat(prompt)
            .contains("summary 값은 40자 미만이면 실패입니다.")
            .contains("허용 종결 목록에 있는 정확한 문자열로만 끝냅니다.")
            .contains("금지 종결")
            .contains("~한다.")
            .contains("~된다.")
            .contains("~신다.")
            .contains("사건을 쉼표처럼 나열하지 말고")
            .contains("~하시고, ~하시며, ~하시고처럼")
            .contains("~하니 보여 줍니다");
    }

    @Test
    void buildIncludesRetryInstructionWithFailedSummary() {
        String prompt = ChapterSummaryPromptBuilder.build(new ChapterSummaryAiRequest(
            "창",
            "창세기",
            2,
            "1 샘플 본문입니다.",
            "summary length must be between 40 and 120 characters: 하나님이 에덴 동산을 지으신다."
        ));

        assertThat(prompt)
            .contains("이전 summary를 그대로 다시 쓰지 마세요.")
            .contains("하나님이 에덴 동산을 지으신다.")
            .contains("40자 이상 120자 이하")
            .contains("허용 종결 중 하나로 끝나는 새 문장");
    }
}
