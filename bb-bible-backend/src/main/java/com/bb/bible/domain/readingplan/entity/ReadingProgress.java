package com.bb.bible.domain.readingplan.entity;

import com.bb.bible.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@AllArgsConstructor(access = lombok.AccessLevel.PRIVATE)
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
@Table(
    name = "reading_progress",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_reading_progress_plan_user_chapter",
            columnNames = {"plan_id", "user_id", "book_code", "chapter_num"}
        )
    }
)
public class ReadingProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private ReadingPlan readingPlan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "book_code", length = 10, nullable = false)
    private String bookCode;

    @Column(name = "chapter_num", nullable = false)
    private Integer chapterNum;

    @Builder.Default
    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt = LocalDateTime.now();
}
