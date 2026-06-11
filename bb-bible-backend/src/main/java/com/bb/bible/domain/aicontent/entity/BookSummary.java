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
    name = "book_summaries",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_book_summary",
            columnNames = {"book_code"}
        )
    }
)
public class BookSummary extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "book_code", length = 10, nullable = false)
    private String bookCode;

    @Column(name = "short_summary", nullable = false, columnDefinition = "TEXT")
    private String shortSummary;

    @Column(name = "summary", nullable = false, columnDefinition = "TEXT")
    private String summary;

    @Column(name = "reading_point", nullable = false, columnDefinition = "TEXT")
    private String readingPoint;

    @Column(name = "keywords", nullable = false, columnDefinition = "TEXT")
    private String keywords;

    @Column(name = "outline", nullable = false, columnDefinition = "TEXT")
    private String outline;

    @Column(name = "model", length = 50)
    private String model;
}
