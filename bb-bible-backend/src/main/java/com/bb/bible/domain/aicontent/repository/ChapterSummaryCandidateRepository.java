package com.bb.bible.domain.aicontent.repository;

import com.bb.bible.domain.aicontent.entity.ChapterSummaryCandidate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChapterSummaryCandidateRepository extends JpaRepository<ChapterSummaryCandidate, Long> {
    Optional<ChapterSummaryCandidate> findByBookCodeAndChapterNum(String bookCode, Integer chapterNum);

    boolean existsByBookCodeAndChapterNum(String bookCode, Integer chapterNum);
}
