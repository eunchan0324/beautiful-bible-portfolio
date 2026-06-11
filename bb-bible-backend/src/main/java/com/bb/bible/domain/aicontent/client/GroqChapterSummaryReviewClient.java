package com.bb.bible.domain.aicontent.client;

import com.bb.bible.domain.aicontent.config.ChapterSummaryAiProperties;
import com.bb.bible.domain.aicontent.entity.ChapterSummaryReviewDecision;
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
@ConditionalOnProperty(prefix = "ai.chapter-summary", name = "review-provider", havingValue = "groq", matchIfMissing = true)
public class GroqChapterSummaryReviewClient implements ChapterSummaryReviewClient {

    private static final String SYSTEM_MESSAGE = """
        너는 성경 앱의 장별 요약 문장 품질을 검수하는 편집자다.
        새 해석을 추가하지 말고 문장 흐름, 자연스러움, 나열식 여부만 판단한다.
        반드시 JSON만 출력한다.
        """;

    private final ChapterSummaryAiProperties properties;
    private final ObjectMapper objectMapper;

    @Override
    public ChapterSummaryReviewResponse review(ChapterSummaryReviewRequest request) {
        if (properties.getReviewApiKey() == null || properties.getReviewApiKey().isBlank()) {
            throw new IllegalStateException("AI_CHAPTER_SUMMARY_REVIEW_API_KEY or GROQ_API_KEY is required");
        }

        RestClient restClient = RestClient.builder()
            .baseUrl(properties.getReviewBaseUrl())
            .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + properties.getReviewApiKey())
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

        return parseReview(content);
    }

    private Map<String, Object> buildRequestBody(ChapterSummaryReviewRequest request) {
        return Map.of(
            "model", properties.getReviewModel(),
            "messages", List.of(
                Map.of("role", "system", "content", SYSTEM_MESSAGE),
                Map.of("role", "user", "content", ChapterSummaryReviewPromptBuilder.build(request))
            ),
            "temperature", 0,
            "max_tokens", 200,
            "response_format", Map.of("type", "json_object")
        );
    }

    private ChapterSummaryReviewResponse parseReview(String content) {
        try {
            JsonNode root = objectMapper.readTree(content);
            JsonNode decision = root.path("decision");
            JsonNode reason = root.path("reason");
            if (!decision.isTextual() || !reason.isTextual()) {
                throw new IllegalStateException("Groq review JSON must contain decision and reason");
            }

            return new ChapterSummaryReviewResponse(
                ChapterSummaryReviewDecision.valueOf(decision.asText()),
                reason.asText(),
                properties.getReviewModel()
            );
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse Groq review JSON", e);
        }
    }
}
