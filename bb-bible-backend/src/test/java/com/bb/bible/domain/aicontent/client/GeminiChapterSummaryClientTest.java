package com.bb.bible.domain.aicontent.client;

import com.bb.bible.domain.aicontent.config.ChapterSummaryAiProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class GeminiChapterSummaryClientTest {

    @Test
    void generateRequiresApiKey() {
        ChapterSummaryAiProperties properties = new ChapterSummaryAiProperties();
        properties.setGenerationProvider("gemini");
        properties.setModel("gemini-2.0-flash");
        properties.setBaseUrl("https://generativelanguage.googleapis.com/v1beta");

        GeminiChapterSummaryClient client = new GeminiChapterSummaryClient(
            properties,
            new ObjectMapper()
        );

        assertThatThrownBy(() -> client.generate(new ChapterSummaryAiRequest(
            "창",
            "창세기",
            1,
            "1 샘플 구절 본문입니다"
        )))
            .isInstanceOf(IllegalStateException.class)
            .hasMessage("AI_CHAPTER_SUMMARY_API_KEY or GEMINI_API_KEY is required");
    }
}
