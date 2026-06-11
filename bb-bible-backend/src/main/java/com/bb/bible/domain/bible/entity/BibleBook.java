package com.bb.bible.domain.bible.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "bible_books")
public class BibleBook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "book_code", length = 10)
    private String bookCode;

    @Column(name = "name_korean", length = 50)
    private String nameKorean;

    @Enumerated(EnumType.STRING)
    @Column(name = "testament", length = 10)
    private Testament testament;

    @Column(name = "book_order")
    private Integer bookOrder;

    @Column(name = "chapter_count")
    private Integer chapterCount;
}
