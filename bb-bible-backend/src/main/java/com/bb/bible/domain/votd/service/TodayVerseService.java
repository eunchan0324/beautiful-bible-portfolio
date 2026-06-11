package com.bb.bible.domain.votd.service;

import com.bb.bible.domain.bible.entity.BibleVerse;
import com.bb.bible.domain.bible.repository.BibleVerseRepository;
import com.bb.bible.domain.votd.dto.TodayVerseResponse;
import com.bb.bible.domain.votd.entity.TodayVerseCandidate;
import com.bb.bible.domain.votd.repository.TodayVerseCandidateRepository;
import com.bb.bible.global.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TodayVerseService {

    private static final LocalDate BASE_DATE = LocalDate.of(2026, 1, 1);

    private final TodayVerseCandidateRepository candidateRepository;
    private final BibleVerseRepository bibleVerseRepository;

    @Transactional(readOnly = true)
    public TodayVerseResponse getTodayVerse() {
        return getTodayVerse(LocalDate.now());
    }

    TodayVerseResponse getTodayVerse(LocalDate today) {
        List<TodayVerseCandidate> candidates = candidateRepository.findAllByOrderBySortOrderAsc();

        if (candidates.isEmpty()) {
            throw new NotFoundException("Today verse candidate not found");
        }

        int index = calculateIndex(today, candidates.size());
        TodayVerseCandidate candidate = candidates.get(index);

        BibleVerse verse = bibleVerseRepository.findByVerseKey(candidate.getVerseKey())
            .orElseThrow(() -> new NotFoundException("Bible verse not found"));

        return new TodayVerseResponse(
            verse.getVerseKey(),
            verse.getChapter().getBook().getBookCode(),
            verse.getChapter().getChapterNum(),
            verse.getVerseNum(),
            verse.getVerseText(),
            candidate.getTheme()
        );
    }

    private int calculateIndex(LocalDate today, int candidateCount) {
        long days = ChronoUnit.DAYS.between(BASE_DATE, today);
        return Math.floorMod(days, candidateCount);
    }
}
