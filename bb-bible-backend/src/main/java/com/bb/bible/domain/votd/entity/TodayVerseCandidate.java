package com.bb.bible.domain.votd.entity;

import com.bb.bible.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
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
    name = "today_verse_candidates",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_today_verse_candidates_verse_key", columnNames = "verse_key"),
        @UniqueConstraint(name = "uk_today_verse_candidates_sort_order", columnNames = "sort_order")
    }
)
public class TodayVerseCandidate extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "verse_key", length = 30, nullable = false)
    private String verseKey;

    @Column(name = "theme", length = 50, nullable = false)
    private String theme;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;
}
