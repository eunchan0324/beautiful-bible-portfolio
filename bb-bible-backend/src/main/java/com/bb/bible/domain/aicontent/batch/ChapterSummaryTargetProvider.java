package com.bb.bible.domain.aicontent.batch;

import com.bb.bible.domain.aicontent.config.ChapterSummaryAiProperties;
import com.bb.bible.domain.aicontent.repository.ChapterSummaryCandidateRepository;
import com.bb.bible.domain.aicontent.repository.ChapterSummaryRepository;
import com.bb.bible.domain.bible.entity.BibleChapter;
import com.bb.bible.domain.bible.repository.BibleChapterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ChapterSummaryTargetProvider {

    private final ChapterSummaryAiProperties properties;
    private final BibleChapterRepository bibleChapterRepository;
    private final ChapterSummaryRepository chapterSummaryRepository;
    private final ChapterSummaryCandidateRepository chapterSummaryCandidateRepository;

    public List<ChapterSummaryTarget> getTargets() {
        List<ChapterSummaryTarget> explicitTargets = properties.getTargets().stream()
            .filter(target -> target != null && !target.isBlank())
            .map(ChapterSummaryTarget::parse)
            .toList();

        if (!explicitTargets.isEmpty()) {
            return explicitTargets;
        }

        if (!properties.isAutoTargetsEnabled()) {
            return List.of();
        }

        return bibleChapterRepository.findAllOrderByBookOrderAndChapterNum().stream()
            .filter(this::doesNotHaveSummaryOrCandidate)
            .limit(properties.getTargetLimit())
            .map(chapter -> new ChapterSummaryTarget(
                chapter.getBook().getBookCode(),
                chapter.getChapterNum()
            ))
            .toList();
    }

    private boolean doesNotHaveSummaryOrCandidate(BibleChapter chapter) {
        String bookCode = chapter.getBook().getBookCode();
        Integer chapterNum = chapter.getChapterNum();
        return !chapterSummaryRepository.existsByBookCodeAndChapterNum(bookCode, chapterNum)
            && !chapterSummaryCandidateRepository.existsByBookCodeAndChapterNum(bookCode, chapterNum);
    }
}
