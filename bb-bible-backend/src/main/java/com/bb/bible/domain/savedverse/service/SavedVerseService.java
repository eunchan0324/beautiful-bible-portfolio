package com.bb.bible.domain.savedverse.service;

import com.bb.bible.domain.bible.entity.BibleVerse;
import com.bb.bible.domain.bible.repository.BibleVerseRepository;
import com.bb.bible.domain.savedverse.dto.SavedVerseRequest;
import com.bb.bible.domain.savedverse.dto.SavedVerseResponse;
import com.bb.bible.domain.savedverse.entity.SavedVerse;
import com.bb.bible.domain.savedverse.repository.SavedVerseRepository;
import com.bb.bible.domain.user.entity.User;
import com.bb.bible.domain.user.service.UserService;
import com.bb.bible.global.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SavedVerseService {

    private final SavedVerseRepository savedVerseRepository;
    private final BibleVerseRepository bibleVerseRepository;
    private final UserService userService;

    @Transactional
    public SavedVerseResponse createSavedVerse(UUID userId, String email, SavedVerseRequest request) {
        User user = userService.getOrCreate(userId, email);

        var verse = bibleVerseRepository.findByVerseKey(request.verseKey())
            .orElseThrow(() -> new NotFoundException("Bible verse not found"));

        if (savedVerseRepository.existsByUserIdAndVerseKey(userId, request.verseKey())) {
            throw new DataIntegrityViolationException("Saved verse already exists");
        }

        SavedVerse savedVerse = SavedVerse.builder()
            .user(user)
            .verseKey(request.verseKey())
            .build();

        SavedVerse saved = savedVerseRepository.save(savedVerse);

        return toResponse(saved, verse);
    }

    @Transactional(readOnly = true)
    public List<SavedVerseResponse> getSavedVerses(UUID userId) {
        return savedVerseRepository.findAllByUserId(userId).stream()
            .map(savedVerse -> {
                BibleVerse verse = bibleVerseRepository.findByVerseKey(savedVerse.getVerseKey())
                    .orElseThrow(() -> new NotFoundException("Bible verse not found"));

                return toResponse(savedVerse, verse);
            })
            .toList();
    }

    @Transactional
    public void deleteSavedVerse(UUID userId, String verseKey) {
        if (!savedVerseRepository.existsByUserIdAndVerseKey(userId, verseKey)) {
            throw new NotFoundException("Saved verse not found");
        }

        savedVerseRepository.deleteByUserIdAndVerseKey(userId, verseKey);
    }

    private SavedVerseResponse toResponse(SavedVerse savedVerse, BibleVerse verse) {
        var chapter = verse.getChapter();
        var book = chapter.getBook();

        return new SavedVerseResponse(
            verse.getVerseKey(),
            book.getBookCode(),
            book.getNameKorean(),
            chapter.getChapterNum(),
            verse.getVerseNum(),
            verse.getVerseText(),
            savedVerse.getCreatedAt()
        );
    }
}
