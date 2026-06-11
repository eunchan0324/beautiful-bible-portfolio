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
@ConditionalOnProperty(prefix = "ai.chapter-summary", name = "generation-provider", havingValue = "gemini")
public class GeminiChapterSummaryClient implements ChapterSummaryAiClient {

    private static final String SYSTEM_MESSAGE = """
        너는 성경 본문을 앱 카드에 들어갈 짧은 한국어 요약으로 만드는 보조자다.
        반드시 summary 필드만 가진 JSON 객체 하나만 출력한다.
        """;

    private final ChapterSummaryAiProperties properties;
    private final ObjectMapper objectMapper;

    @Override
    public ChapterSummaryAiResponse generate(ChapterSummaryAiRequest request) {
        if (properties.getApiKey() == null || properties.getApiKey().isBlank()) {
            throw new IllegalStateException("AI_CHAPTER_SUMMARY_API_KEY or GEMINI_API_KEY is required");
        }

        RestClient restClient = RestClient.builder()
            .baseUrl(properties.getBaseUrl())
            .defaultHeader("x-goog-api-key", properties.getApiKey())
            .defaultHeader(HttpHeaders.CONTENT_TYPE, "application/json")
            .build();

        JsonNode response = restClient.post()
            .uri("/models/{model}:generateContent", properties.getModel())
            .body(buildRequestBody(request))
            .retrieve()
            .body(JsonNode.class);

        String content = extractText(response);
        String summary = parseSummary(content);

        return new ChapterSummaryAiResponse(summary, properties.getModel());
    }

    private Map<String, Object> buildRequestBody(ChapterSummaryAiRequest request) {
        return Map.of(
            "systemInstruction", Map.of(
                "parts", List.of(Map.of("text", SYSTEM_MESSAGE))
            ),
            "contents", List.of(
                Map.of(
                    "role", "user",
                    "parts", List.of(Map.of("text", ChapterSummaryPromptBuilder.build(request)))
                )
            ),
            "generationConfig", Map.of(
                "temperature", 0.1,
                "maxOutputTokens", 500,
                "responseMimeType", "application/json",
                "thinkingConfig", Map.of("thinkingBudget", 0)
            )
        );
    }

    private String extractText(JsonNode response) {
        JsonNode parts = response
            .path("candidates")
            .path(0)
            .path("content")
            .path("parts");

        if (!parts.isArray() || parts.isEmpty()) {
            throw new IllegalStateException("Gemini response does not contain output text: " + response);
        }

        StringBuilder text = new StringBuilder();
        for (JsonNode part : parts) {
            JsonNode partText = part.path("text");
            if (partText.isTextual()) {
                text.append(partText.asText());
            }
        }

        String outputText = text.toString();
        if (outputText.isBlank()) {
            throw new IllegalStateException("Gemini response output text is blank: " + response);
        }
        return outputText;
    }

    private String parseSummary(String content) {
        try {
            JsonNode root = objectMapper.readTree(cleanJson(content));
            JsonNode summary = root.path("summary");
            if (!summary.isTextual()) {
                throw new IllegalStateException("Gemini response JSON does not contain summary");
            }
            return summary.asText();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse Gemini summary JSON: " + content, e);
        }
    }

    private String cleanJson(String content) {
        String trimmed = content == null ? "" : content.trim();
        if (trimmed.startsWith("```json")) {
            return trimmed.substring(7, trimmed.lastIndexOf("```")).trim();
        }
        if (trimmed.startsWith("```")) {
            return trimmed.substring(3, trimmed.lastIndexOf("```")).trim();
        }
        return trimmed;
    }
}
