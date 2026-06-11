package com.bb.bible.domain.votd.repository;

import com.bb.bible.domain.votd.entity.TodayVerseCandidate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TodayVerseCandidateRepository extends JpaRepository<TodayVerseCandidate, Long> {

    List<TodayVerseCandidate> findAllByOrderBySortOrderAsc();
}
