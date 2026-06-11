package com.bb.bible.domain.aicontent.entity;

import com.bb.bible.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
    name = "person_commentaries",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_person_commentary",
            columnNames = {"person_code"}
        )
    }
)
public class PersonCommentary extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "person_code", length = 80, nullable = false)
    private String personCode;

    @Column(name = "name", length = 80, nullable = false)
    private String name;

    @Column(name = "short_description", nullable = false, columnDefinition = "TEXT")
    private String shortDescription;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "story_flow", nullable = false, columnDefinition = "TEXT")
    private String storyFlow;

    @Column(name = "key_verses", nullable = false, columnDefinition = "TEXT")
    private String keyVerses;

    @Column(name = "related_books", nullable = false, columnDefinition = "TEXT")
    private String relatedBooks;

    @Column(name = "keywords", nullable = false, columnDefinition = "TEXT")
    private String keywords;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private PersonCommentaryStatus status;

    @Column(name = "model", length = 50)
    private String model;
}
