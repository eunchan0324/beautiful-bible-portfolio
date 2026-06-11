package com.bb.bible.domain.aicontent.repository;

import com.bb.bible.domain.aicontent.entity.ChapterSummary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChapterSummaryRepository extends JpaRepository<ChapterSummary, Long> {
    Optional<ChapterSummary> findByBookCodeAndChapterNum(String bookCode, Integer chapterNum);

    boolean existsByBookCodeAndChapterNum(String bookCode, Integer chapterNum);
}
