package com.bb.bible.domain.aicontent.service;

import com.bb.bible.domain.aicontent.client.ChapterSummaryAiClient;
import com.bb.bible.domain.aicontent.client.ChapterSummaryAiRequest;
import com.bb.bible.domain.aicontent.client.ChapterSummaryAiResponse;
import com.bb.bible.domain.aicontent.client.ChapterSummaryReviewClient;
import com.bb.bible.domain.aicontent.client.ChapterSummaryReviewRequest;
import com.bb.bible.domain.aicontent.client.ChapterSummaryReviewResponse;
import com.bb.bible.domain.aicontent.config.ChapterSummaryAiProperties;
import com.bb.bible.domain.aicontent.entity.ChapterSummaryCandidate;
import com.bb.bible.domain.aicontent.entity.ChapterSummaryCandidateStatus;
import com.bb.bible.domain.aicontent.entity.ChapterSummaryReviewDecision;
import com.bb.bible.domain.aicontent.repository.ChapterSummaryCandidateRepository;
import com.bb.bible.domain.aicontent.repository.ChapterSummaryRepository;
import com.bb.bible.domain.bible.entity.BibleChapter;
import com.bb.bible.domain.bible.entity.BibleVerse;
import com.bb.bible.domain.bible.repository.BibleChapterRepository;
import com.bb.bible.domain.bible.repository.BibleVerseRepository;
import com.bb.bible.global.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChapterSummaryGenerationService {

    private final BibleChapterRepository bibleChapterRepository;
    private final BibleVerseRepository bibleVerseRepository;
    private final ChapterSummaryRepository chapterSummaryRepository;
    private final ChapterSummaryCandidateRepository chapterSummaryCandidateRepository;
    private final ChapterSummaryAiClient chapterSummaryAiClient;
    private final ChapterSummaryReviewClient chapterSummaryReviewClient;
    private final ChapterSummaryValidationService chapterSummaryValidationService;
    private final ChapterSummaryAiProperties properties;

    @Transactional
    public ChapterSummaryGenerationResult generate(String bookCode, Integer chapterNum) {
        if (chapterSummaryRepository.findByBookCodeAndChapterNum(bookCode, chapterNum).isPresent()) {
            return ChapterSummaryGenerationResult.skipped(bookCode, chapterNum, "summary already exists");
        }
        if (chapterSummaryCandidateRepository.existsByBookCodeAndChapterNum(bookCode, chapterNum)) {
            return ChapterSummaryGenerationResult.skipped(bookCode, chapterNum, "summary candidate already exists");
        }

        BibleChapter chapter = bibleChapterRepository.findByBook_BookCodeAndChapterNum(bookCode, chapterNum)
            .orElseThrow(() -> new NotFoundException("Bible chapter not found"));

        List<BibleVerse> verses = bibleVerseRepository.findByChapterIdOrderByVerseNumAsc(chapter.getId());
        if (verses.isEmpty()) {
            return ChapterSummaryGenerationResult.skipped(bookCode, chapterNum, "chapter has no verses");
        }

        String chapterText = buildChapterText(verses);

        ChapterSummaryAiResponse response = null;
        ChapterSummaryValidationResult validationResult = null;
        String retryReason = null;
        String lastSummary = null;

        for (int attempt = 1; attempt <= properties.getMaxAttempts(); attempt++) {
            response = chapterSummaryAiClient.generate(new ChapterSummaryAiRequest(
                bookCode,
                chapter.getBook().getNameKorean(),
                chapterNum,
                chapterText,
                retryReason
            ));

            String normalizedSummary = ChapterSummaryTextNormalizer.normalize(response.summary());
            response = new ChapterSummaryAiResponse(normalizedSummary, response.model());
            lastSummary = response.summary();
            validationResult = chapterSummaryValidationService.validate(response.summary());
            if (validationResult.valid()) {
                break;
            }

            log.warn(
                "Chapter summary validation failed: bookCode={}, chapterNum={}, attempt={}, reason={}, summary={}",
                bookCode,
                chapterNum,
                attempt,
                validationResult.message(),
                response.summary()
            );
            retryReason = validationResult.message() + ": " + response.summary();
        }

        if (validationResult == null || !validationResult.valid()) {
            String message = validationResult == null ? "summary generation failed" : validationResult.message();
            if (lastSummary != null && !lastSummary.isBlank()) {
                chapterSummaryCandidateRepository.save(ChapterSummaryCandidate.builder()
                    .bookCode(bookCode)
                    .chapterNum(chapterNum)
                    .summary(lastSummary)
                    .generationModel(response == null ? null : response.model())
                    .reviewDecision(ChapterSummaryReviewDecision.REVIEW)
                    .reviewReason(message)
                    .reviewModel("rule-validation")
                    .status(ChapterSummaryCandidateStatus.PENDING)
                    .build());
                return ChapterSummaryGenerationResult.saved(bookCode, chapterNum);
            }
            return ChapterSummaryGenerationResult.skipped(bookCode, chapterNum, message);
        }

        ChapterSummaryReviewResponse review = chapterSummaryReviewClient.review(new ChapterSummaryReviewRequest(
            bookCode,
            chapterNum,
            response.summary()
        ));

        chapterSummaryCandidateRepository.save(ChapterSummaryCandidate.builder()
            .bookCode(bookCode)
            .chapterNum(chapterNum)
            .summary(response.summary())
            .generationModel(response.model())
            .reviewDecision(review.decision())
            .reviewReason(review.reason())
            .reviewModel(review.model())
            .status(ChapterSummaryCandidateStatus.PENDING)
            .build());

        return ChapterSummaryGenerationResult.saved(bookCode, chapterNum);
    }

    private String buildChapterText(List<BibleVerse> verses) {
        return verses.stream()
            .map(verse -> verse.getVerseNum() + " " + verse.getVerseText())
            .collect(Collectors.joining("\n"));
    }
}
