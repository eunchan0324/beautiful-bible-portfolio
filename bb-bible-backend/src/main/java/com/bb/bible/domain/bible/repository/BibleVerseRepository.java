package com.bb.bible.domain.bible.repository;

import com.bb.bible.domain.bible.entity.BibleVerse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BibleVerseRepository extends JpaRepository<BibleVerse, Long> {
    Optional<BibleVerse> findByVerseKey(String verseKey);

    List<BibleVerse> findByChapterId(Long chapterId);

    List<BibleVerse> findByChapterIdOrderByVerseNumAsc(Long chapterId);

    Page<BibleVerse> findByVerseTextContaining(String keyword, Pageable pageable);

    @Query(
        value = """
        SELECT *
        FROM bible_verses
        WHERE to_tsvector('simple', verse_text) @@ plainto_tsquery('simple', :keyword)
        """,
        countQuery = """
        SELECT count(*)
        FROM bible_verses
        WHERE to_tsvector('simple', verse_text) @@ plainto_tsquery('simple', :keyword)
        """,
        nativeQuery = true
    )
    Page<BibleVerse> searchByFullText(@Param("keyword") String keyword, Pageable pageable);
}
