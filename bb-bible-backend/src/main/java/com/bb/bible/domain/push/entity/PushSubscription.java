package com.bb.bible.domain.push.entity;

import com.bb.bible.domain.user.entity.User;
import com.bb.bible.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(
    name = "push_subscriptions",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_push_subscriptions_endpoint", columnNames = "endpoint")
    }
)
public class PushSubscription extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "endpoint", length = 500, nullable = false)
    private String endpoint;

    @Column(name = "p256dh", length = 255, nullable = false)
    private String p256dh;

    @Column(name = "auth", length = 100, nullable = false)
    private String auth;

    @Builder.Default
    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;

    public void enable() {
        this.enabled = true;
    }

    public void disable() {
        this.enabled = false;
    }
}
