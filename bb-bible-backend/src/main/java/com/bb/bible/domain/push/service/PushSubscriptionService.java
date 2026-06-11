package com.bb.bible.domain.push.service;

import com.bb.bible.domain.push.dto.PushSubscriptionRequest;
import com.bb.bible.domain.push.entity.PushSubscription;
import com.bb.bible.domain.push.repository.PushSubscriptionRepository;
import com.bb.bible.domain.user.entity.User;
import com.bb.bible.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PushSubscriptionService {

    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final UserService userService;

    @Transactional
    public void saveSubscription(UUID userId, String email, PushSubscriptionRequest request) {
        User user = userService.getOrCreate(userId, email);

        PushSubscription subscription = pushSubscriptionRepository.findByEndpoint(request.endpoint())
            .orElseGet(() -> pushSubscriptionRepository.save(
                PushSubscription.builder()
                    .user(user)
                    .endpoint(request.endpoint())
                    .p256dh(request.p256dh())
                    .auth(request.auth())
                    .build()
            ));

        subscription.enable();
    }

    @Transactional
    public void deleteSubscription(UUID userId, PushSubscriptionRequest request) {
        pushSubscriptionRepository.findByUserIdAndEndpoint(userId, request.endpoint())
            .ifPresent(PushSubscription::disable);
    }
}
