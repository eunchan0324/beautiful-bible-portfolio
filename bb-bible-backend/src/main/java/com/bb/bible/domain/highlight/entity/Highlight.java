package com.bb.bible.domain.highlight.entity;

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
    name = "highlights",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_highlights_user_verse",
            columnNames = {"user_id", "verse_key"}
        )
    }
)
public class Highlight extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "verse_key", length = 30, nullable = false)
    private String verseKey;

    @Column(name = "color", length = 10, nullable = false)
    private String color;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    public void update(String color, String note) {
        this.color = color;
        this.note = note;
    }
}
