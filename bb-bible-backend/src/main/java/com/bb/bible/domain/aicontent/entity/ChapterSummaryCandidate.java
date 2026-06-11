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
    name = "chapter_summary_candidates",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_chapter_summary_candidate",
            columnNames = {"book_code", "chapter_num"}
        )
    }
)
public class ChapterSummaryCandidate extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "book_code", length = 10, nullable = false)
    private String bookCode;

    @Column(name = "chapter_num", nullable = false)
    private Integer chapterNum;

    @Column(name = "summary", nullable = false, columnDefinition = "TEXT")
    private String summary;

    @Column(name = "generation_model", length = 50)
    private String generationModel;

    @Enumerated(EnumType.STRING)
    @Column(name = "review_decision", length = 20, nullable = false)
    private ChapterSummaryReviewDecision reviewDecision;

    @Column(name = "review_reason", columnDefinition = "TEXT")
    private String reviewReason;

    @Column(name = "review_model", length = 50)
    private String reviewModel;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private ChapterSummaryCandidateStatus status;
}
