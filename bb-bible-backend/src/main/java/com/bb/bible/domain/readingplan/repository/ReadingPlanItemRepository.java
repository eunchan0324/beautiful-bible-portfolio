package com.bb.bible.domain.readingplan.repository;

import com.bb.bible.domain.readingplan.entity.ReadingPlanItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReadingPlanItemRepository extends JpaRepository<ReadingPlanItem, Long> {
    List<ReadingPlanItem> findByPlanIdOrderByItemOrderAsc(Long planId);

    List<ReadingPlanItem> findByPlanIdAndDayNumberOrderByItemOrderAsc(Long planId, Integer dayNumber);

    boolean existsByPlanIdAndBookCodeAndChapterNum(Long planId, String bookCode, Integer chapterNum);

    long countByPlanId(Long planId);
}
