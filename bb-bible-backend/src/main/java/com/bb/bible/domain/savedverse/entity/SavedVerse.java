package com.bb.bible.domain.savedverse.entity;

import com.bb.bible.domain.user.entity.User;
import com.bb.bible.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
    name = "saved_verses",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_saved_verses_user_verse",
            columnNames = {"user_id", "verse_key"}
        )
    }
)
public class SavedVerse extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "verse_key", length = 30, nullable = false)
    private String verseKey;
}
