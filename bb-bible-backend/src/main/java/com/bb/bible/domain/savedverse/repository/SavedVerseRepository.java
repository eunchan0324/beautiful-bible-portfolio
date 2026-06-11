package com.bb.bible.domain.savedverse.repository;

import com.bb.bible.domain.savedverse.entity.SavedVerse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SavedVerseRepository extends JpaRepository<SavedVerse, Long> {
    List<SavedVerse> findAllByUserId(UUID userId);

    boolean existsByUserIdAndVerseKey(UUID userId, String verseKey);

    void deleteByUserIdAndVerseKey(UUID userId, String verseKey);
}
