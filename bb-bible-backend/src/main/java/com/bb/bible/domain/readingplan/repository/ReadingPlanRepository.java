package com.bb.bible.domain.readingplan.repository;

import com.bb.bible.domain.readingplan.entity.ReadingPlan;
import com.bb.bible.domain.readingplan.entity.ReadingPlanStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ReadingPlanRepository extends JpaRepository<ReadingPlan, Long> {
    Optional<ReadingPlan> findByUserIdAndStatus(UUID userId, ReadingPlanStatus status);

    boolean existsByUserIdAndStatus(UUID userId, ReadingPlanStatus status);
}
