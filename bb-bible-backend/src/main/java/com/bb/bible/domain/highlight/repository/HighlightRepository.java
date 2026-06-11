package com.bb.bible.domain.highlight.repository;

import com.bb.bible.domain.highlight.entity.Highlight;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HighlightRepository extends JpaRepository<Highlight, Long> {
    List<Highlight> findAllByUserId(UUID userId);

    Optional<Highlight> findByUserIdAndVerseKey(UUID userId, String verseKey);

    void deleteByUserIdAndVerseKey(UUID userId, String verseKey);
}
