package com.bb.bible.domain.aicontent.client;

import com.bb.bible.domain.aicontent.config.ChapterSummaryAiProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class OpenAiChapterSummaryClientTest {

    @Test
    void buildRequestBodyUsesLowLatencyGptFiveNanoOptions() throws Exception {
        ChapterSummaryAiProperties properties = new ChapterSummaryAiProperties();
        properties.setModel("gpt-5-nano");

        OpenAiChapterSummaryClient client = new OpenAiChapterSummaryClient(
            properties,
            new ObjectMapper()
        );

        Method method = OpenAiChapterSummaryClient.class.getDeclaredMethod(
            "buildRequestBody",
            ChapterSummaryAiRequest.class
        );
        method.setAccessible(true);

        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) method.invoke(
            client,
            new ChapterSummaryAiRequest(
                "창",
                "창세기",
                1,
                "1 샘플 구절 본문입니다",
                null
            )
        );

        assertThat(body.get("model")).isEqualTo("gpt-5-nano");
        assertThat(body.get("input").toString())
            .contains("허용 종결")
            .contains("금지 종결")
            .contains("사건을 쉼표처럼 나열하지 말고");
        assertThat(body.get("reasoning"))
            .isEqualTo(Map.of("effort", "low"));

        @SuppressWarnings("unchecked")
        Map<String, Object> text = (Map<String, Object>) body.get("text");
        assertThat(text.get("verbosity")).isEqualTo("low");
        assertThat(text.get("format")).isInstanceOf(Map.class);
    }
}
