package com.bb.bible.domain.push.controller;

import com.bb.bible.domain.push.dto.PushSubscriptionRequest;
import com.bb.bible.domain.push.service.PushSubscriptionService;
import com.bb.bible.global.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/push-subscriptions")
@RequiredArgsConstructor
public class PushSubscriptionController {

    private final PushSubscriptionService pushSubscriptionService;

    @PostMapping
    public void saveSubscription(
        @AuthenticationPrincipal JwtTokenProvider.AuthUser authUser,
        @RequestBody PushSubscriptionRequest request
    ) {
        pushSubscriptionService.saveSubscription(
            UUID.fromString(authUser.sub()),
            authUser.email(),
            request
        );
    }

    @DeleteMapping
    public void deleteSubscription(
        @AuthenticationPrincipal JwtTokenProvider.AuthUser authUser,
        @RequestBody PushSubscriptionRequest request
    ) {
        pushSubscriptionService.deleteSubscription(
            UUID.fromString(authUser.sub()),
            request
        );
    }
}
