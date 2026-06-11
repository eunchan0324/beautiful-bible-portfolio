package com.bb.bible.global.ratelimit;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class RateLimitBucketProvider {

    private final RateLimitProperties properties;
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public Bucket resolveBucket(String key) {
        return buckets.computeIfAbsent(key, ignored -> createBucket());
    }

    private Bucket createBucket() {
        Bandwidth limit = Bandwidth.builder()
            .capacity(properties.capacity())
            .refillIntervally(
                properties.refillTokens(),
                Duration.ofSeconds(properties.refillDurationSeconds())
            )
            .build();

        return Bucket.builder()
            .addLimit(limit)
            .build();
    }
}
