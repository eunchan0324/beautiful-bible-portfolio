package com.bb.bible.domain.bible.repository;

import com.bb.bible.domain.bible.entity.BibleChapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface BibleChapterRepository extends JpaRepository<BibleChapter, Long> {
    Optional<BibleChapter> findByBook_BookCodeAndChapterNum(String bookCode, int chapterNumber);

    List<BibleChapter> findByBook_BookCode(String bookCode);

    @Query("""
        SELECT chapter
        FROM BibleChapter chapter
        JOIN FETCH chapter.book book
        ORDER BY book.bookOrder ASC, chapter.chapterNum ASC
        """)
    List<BibleChapter> findAllOrderByBookOrderAndChapterNum();
}
