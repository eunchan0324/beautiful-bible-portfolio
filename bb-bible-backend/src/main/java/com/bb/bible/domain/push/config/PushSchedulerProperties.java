package com.bb.bible.domain.push.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "push.scheduler")
public record PushSchedulerProperties(
    String secret
) {
    public boolean matches(String value) {
        return hasText(secret) && secret.equals(value);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
