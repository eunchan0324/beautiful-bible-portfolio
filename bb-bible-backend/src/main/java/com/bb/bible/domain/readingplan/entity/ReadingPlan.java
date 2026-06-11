package com.bb.bible.domain.readingplan.entity;

import com.bb.bible.domain.user.entity.User;
import com.bb.bible.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "reading_plans")
public class ReadingPlan extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "title", length = 100, nullable = false)
    private String title;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "daily_chapter_target", nullable = false)
    private Integer dailyChapterTarget;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", length = 20, nullable = false)
    private ReadingPlanStatus status = ReadingPlanStatus.IN_PROGRESS;

    public void complete() {
        this.status = ReadingPlanStatus.COMPLETED;
    }
}
