package com.bb.bible.domain.push.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "web-push")
public record WebPushProperties(
    String publicKey,
    String privateKey,
    String subject
) {
    public boolean isConfigured() {
        return hasText(publicKey) && hasText(privateKey) && hasText(subject);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
