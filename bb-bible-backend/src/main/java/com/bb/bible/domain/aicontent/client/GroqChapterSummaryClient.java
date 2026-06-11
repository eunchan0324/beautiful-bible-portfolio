package com.bb.bible.domain.aicontent.client;

import com.bb.bible.domain.aicontent.config.ChapterSummaryAiProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "ai.chapter-summary", name = "generation-provider", havingValue = "groq", matchIfMissing = true)
public class GroqChapterSummaryClient implements ChapterSummaryAiClient {

    private static final String SYSTEM_MESSAGE = """
        너는 성경 본문을 앱 카드에 들어갈 짧은 한국어 요약으로 만드는 보조자다.
        반드시 summary 필드만 가진 JSON 객체 하나만 출력한다.
        """;

    private final ChapterSummaryAiProperties properties;
    private final ObjectMapper objectMapper;

    @Override
    public ChapterSummaryAiResponse generate(ChapterSummaryAiRequest request) {
        if (properties.getApiKey() == null || properties.getApiKey().isBlank()) {
            throw new IllegalStateException("AI_CHAPTER_SUMMARY_API_KEY or GROQ_API_KEY is required");
        }

        RestClient restClient = RestClient.builder()
            .baseUrl(properties.getBaseUrl())
            .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + properties.getApiKey())
            .build();

        JsonNode response = restClient.post()
            .uri("/chat/completions")
            .body(buildRequestBody(request))
            .retrieve()
            .body(JsonNode.class);

        String content = response
            .path("choices")
            .path(0)
            .path("message")
            .path("content")
            .asText();

        String summary = parseSummary(content);

        return new ChapterSummaryAiResponse(summary, properties.getModel());
    }

    private Map<String, Object> buildRequestBody(ChapterSummaryAiRequest request) {
        return Map.of(
            "model", properties.getModel(),
            "messages", List.of(
                Map.of("role", "system", "content", SYSTEM_MESSAGE),
                Map.of("role", "user", "content", ChapterSummaryPromptBuilder.build(request))
            ),
            "temperature", 0.1,
            "max_tokens", 300,
            "response_format", Map.of("type", "json_object")
        );
    }

    private String parseSummary(String content) {
        try {
            JsonNode root = objectMapper.readTree(content);
            JsonNode summary = root.path("summary");
            if (!summary.isTextual()) {
                throw new IllegalStateException("Groq response JSON does not contain summary");
            }
            return summary.asText();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse Groq summary JSON", e);
        }
    }
}
