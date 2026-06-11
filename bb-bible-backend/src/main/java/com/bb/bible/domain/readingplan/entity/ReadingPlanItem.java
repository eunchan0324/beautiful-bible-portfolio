package com.bb.bible.domain.readingplan.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Builder
@AllArgsConstructor(access = lombok.AccessLevel.PRIVATE)
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
@Table(
    name = "reading_plan_items",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_reading_plan_items_plan_book_chapter",
            columnNames = {"plan_id", "book_code", "chapter_num"}
        ),
        @UniqueConstraint(
            name = "uk_reading_plan_items_plan_order",
            columnNames = {"plan_id", "item_order"}
        )
    }
)
public class ReadingPlanItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private ReadingPlan plan;

    @Column(name = "day_number", nullable = false)
    private Integer dayNumber;

    @Column(name = "book_code", length = 10, nullable = false)
    private String bookCode;

    @Column(name = "chapter_num", nullable = false)
    private Integer chapterNum;

    @Column(name = "item_order", nullable = false)
    private Integer itemOrder;
}
