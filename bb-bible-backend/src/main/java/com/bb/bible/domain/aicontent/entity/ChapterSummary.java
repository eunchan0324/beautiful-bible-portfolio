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
    name = "chapter_summaries",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_chapter_summary",
            columnNames = {"book_code", "chapter_num"}
        )
    }
)
public class ChapterSummary extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "book_code", length = 10, nullable = false)
    private String bookCode;

    @Column(name = "chapter_num", nullable = false)
    private Integer chapterNum;

    @Column(name = "summary", nullable = false, columnDefinition = "TEXT")
    private String summary;

    @Column(name = "model", length = 50)
    private String model;
}
