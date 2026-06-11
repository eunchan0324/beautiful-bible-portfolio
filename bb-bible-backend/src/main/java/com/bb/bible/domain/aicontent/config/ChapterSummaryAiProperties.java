package com.bb.bible.domain.aicontent.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ConfigurationProperties(prefix = "ai.chapter-summary")
public class ChapterSummaryAiProperties {

    private boolean enabled = false;

    private String provider = "groq";

    private String generationProvider = "groq";

    private String reviewProvider = "groq";

    private String model = "llama-3.3-70b-versatile";

    private String apiKey;

    private String baseUrl = "https://api.groq.com/openai/v1";

    private String reasoningEffort = "low";

    private String textVerbosity = "low";

    private String reviewModel = "llama-3.3-70b-versatile";

    private String reviewApiKey;

    private String reviewBaseUrl = "https://api.groq.com/openai/v1";

    private int maxAttempts = 2;

    private boolean autoTargetsEnabled = false;

    private int targetLimit = 5;

    private long requestDelayMillis = 0;

    private List<String> targets = new ArrayList<>();
}
