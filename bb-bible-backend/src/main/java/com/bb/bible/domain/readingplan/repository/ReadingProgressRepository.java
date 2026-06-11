package com.bb.bible.domain.readingplan.repository;

import com.bb.bible.domain.readingplan.entity.ReadingProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReadingProgressRepository extends JpaRepository<ReadingProgress, Long> {

    boolean existsByReadingPlanIdAndUserIdAndBookCodeAndChapterNum(Long planId, UUID userId, String bookCode, Integer chapterNum);

    List<ReadingProgress> findByReadingPlanIdAndUserId(Long planId, UUID userId);

    long countByReadingPlanIdAndUserId(Long planId, UUID userId);
}
