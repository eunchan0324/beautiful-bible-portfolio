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
@Table(name = "bible_verses")
public class BibleVerse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id")
    private BibleChapter chapter;

    @Column(name = "verse_num")
    private Integer verseNum;

    @Column(name = "verse_text", columnDefinition = "TEXT")
    private String verseText;

    @Column(name = "verse_key", length = 30, unique = true, nullable = false)
    private String verseKey;
}
