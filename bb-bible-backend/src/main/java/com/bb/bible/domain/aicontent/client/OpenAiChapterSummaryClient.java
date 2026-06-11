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
@ConditionalOnProperty(prefix = "ai.chapter-summary", name = "generation-provider", havingValue = "openai")
public class OpenAiChapterSummaryClient implements ChapterSummaryAiClient {

    private static final String INSTRUCTIONS = """
        당신은 성경 본문을 짧고 객관적으로 요약하는 보조자입니다.
        기독교적 전통을 존중하되, 교리적 논쟁이 있는 장은 구속사적 결론을 단정하지 말고 본문에 기술된 서사와 묘사 자체에 집중하세요.
        독자 권면, 묵상 적용, 설교적 표현을 사용하지 마세요.
        """;

    private final ChapterSummaryAiProperties properties;
    private final ObjectMapper objectMapper;

    @Override
    public ChapterSummaryAiResponse generate(ChapterSummaryAiRequest request) {
        if (properties.getApiKey() == null || properties.getApiKey().isBlank()) {
            throw new IllegalStateException("OPENAI_API_KEY is required to generate chapter summaries");
        }

        RestClient restClient = RestClient.builder()
            .baseUrl(properties.getBaseUrl())
            .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + properties.getApiKey())
            .build();

        JsonNode response = restClient.post()
            .uri("/responses")
            .body(buildRequestBody(request))
            .retrieve()
            .body(JsonNode.class);

        String outputText = extractOutputText(response);
        String summary = parseSummary(outputText);

        return new ChapterSummaryAiResponse(summary, properties.getModel());
    }

    private Map<String, Object> buildRequestBody(ChapterSummaryAiRequest request) {
        return Map.of(
            "model", properties.getModel(),
            "instructions", INSTRUCTIONS,
            "input", ChapterSummaryPromptBuilder.build(request),
            "store", false,
            "reasoning", Map.of(
                "effort", properties.getReasoningEffort()
            ),
            "text", Map.of(
                "verbosity", properties.getTextVerbosity(),
                "format", Map.of(
                    "type", "json_schema",
                    "name", "chapter_summary",
                    "strict", true,
                    "schema", Map.of(
                        "type", "object",
                        "additionalProperties", false,
                        "required", List.of("summary"),
                        "properties", Map.of(
                            "summary", Map.of("type", "string")
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

    private String parseSummary(String outputText) {
        try {
            JsonNode root = objectMapper.readTree(outputText);
            JsonNode summary = root.path("summary");
            if (!summary.isTextual()) {
                throw new IllegalStateException("OpenAI response JSON does not contain summary");
            }
            return summary.asText();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse OpenAI summary JSON", e);
        }
    }
}
