package com.bb.bible.domain.push.dto;

public record PushSubscriptionRequest(
    String endpoint,
    String p256dh,
    String auth
) {
}
