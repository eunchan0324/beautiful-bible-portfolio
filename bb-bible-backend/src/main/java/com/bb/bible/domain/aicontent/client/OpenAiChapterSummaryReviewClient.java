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
@ConditionalOnProperty(prefix = "ai.chapter-summary", name = "review-provider", havingValue = "openai")
public class OpenAiChapterSummaryReviewClient implements ChapterSummaryReviewClient {

    private static final String INSTRUCTIONS = """
        너는 성경 앱의 장별 요약 문장 품질을 검수하는 편집자다.
        새 해석을 추가하지 말고 문장 흐름, 자연스러움, 나열식 여부만 판단한다.
        반드시 JSON만 출력한다.
        """;

    private final ChapterSummaryAiProperties properties;
    private final ObjectMapper objectMapper;

    @Override
    public ChapterSummaryReviewResponse review(ChapterSummaryReviewRequest request) {
        if (properties.getReviewApiKey() == null || properties.getReviewApiKey().isBlank()) {
            throw new IllegalStateException("AI_CHAPTER_SUMMARY_REVIEW_API_KEY is required to review chapter summaries");
        }

        RestClient restClient = RestClient.builder()
            .baseUrl(properties.getReviewBaseUrl())
            .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + properties.getReviewApiKey())
            .build();

        JsonNode response = restClient.post()
            .uri("/responses")
            .body(buildRequestBody(request))
            .retrieve()
            .body(JsonNode.class);

        return parseReview(extractOutputText(response));
    }

    private Map<String, Object> buildRequestBody(ChapterSummaryReviewRequest request) {
        return Map.of(
            "model", properties.getReviewModel(),
            "instructions", INSTRUCTIONS,
            "input", ChapterSummaryReviewPromptBuilder.build(request),
            "store", false,
            "text", Map.of(
                "format", Map.of(
                    "type", "json_schema",
                    "name", "chapter_summary_review",
                    "strict", true,
                    "schema", Map.of(
                        "type", "object",
                        "additionalProperties", false,
                        "required", List.of("decision", "reason"),
                        "properties", Map.of(
                            "decision", Map.of(
                                "type", "string",
                                "enum", List.of("PASS", "REVIEW", "REJECT")
                            ),
                            "reason", Map.of("type", "string")
                        )
                    )
                )
            )
        );
    }

    private String extractOutputText(JsonNode response) {
        if (response == null) {
            throw new IllegalStateException("OpenAI response is empty");
        }

        JsonNode outputText = response.path("output_text");
        if (outputText.isTextual() && !outputText.asText().isBlank()) {
            return outputText.asText();
        }

        for (JsonNode output : response.path("output")) {
            for (JsonNode content : output.path("content")) {
                JsonNode text = content.path("text");
                if (text.isTextual() && !text.asText().isBlank()) {
                    return text.asText();
                }
            }
        }

        throw new IllegalStateException("OpenAI response does not contain output text");
    }

    private ChapterSummaryReviewResponse parseReview(String outputText) {
        try {
            JsonNode root = objectMapper.readTree(outputText);
            JsonNode decision = root.path("decision");
            JsonNode reason = root.path("reason");
            if (!decision.isTextual() || !reason.isTextual()) {
                throw new IllegalStateException("OpenAI review JSON must contain decision and reason");
            }

            return new ChapterSummaryReviewResponse(
                ChapterSummaryReviewDecision.valueOf(decision.asText()),
                reason.asText(),
                properties.getReviewModel()
            );
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse OpenAI review JSON", e);
        }
    }
}
