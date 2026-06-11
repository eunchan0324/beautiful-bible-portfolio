package com.bb.bible.domain.push.repository;

import com.bb.bible.domain.push.entity.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {
    Optional<PushSubscription> findByEndpoint(String endpoint);

    List<PushSubscription> findAllByEnabledTrue();

    Optional<PushSubscription> findByUserIdAndEndpoint(UUID userId, String endpoint);
}
