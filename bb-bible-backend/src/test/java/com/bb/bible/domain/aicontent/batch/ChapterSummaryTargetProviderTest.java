package com.bb.bible.domain.aicontent.batch;

import com.bb.bible.domain.aicontent.config.ChapterSummaryAiProperties;
import com.bb.bible.domain.aicontent.repository.ChapterSummaryCandidateRepository;
import com.bb.bible.domain.aicontent.repository.ChapterSummaryRepository;
import com.bb.bible.domain.bible.entity.BibleBook;
import com.bb.bible.domain.bible.entity.BibleChapter;
import com.bb.bible.domain.bible.repository.BibleChapterRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChapterSummaryTargetProviderTest {

    @Mock
    private BibleChapterRepository bibleChapterRepository;

    @Mock
    private ChapterSummaryRepository chapterSummaryRepository;

    @Mock
    private ChapterSummaryCandidateRepository chapterSummaryCandidateRepository;

    private ChapterSummaryAiProperties properties;
    private ChapterSummaryTargetProvider targetProvider;

    @BeforeEach
    void setUp() {
        properties = new ChapterSummaryAiProperties();
        targetProvider = new ChapterSummaryTargetProvider(
            properties,
            bibleChapterRepository,
            chapterSummaryRepository,
            chapterSummaryCandidateRepository
        );
    }

    @Test
    void getTargetsUsesExplicitTargetsFirst() {
        properties.setTargets(List.of("창:2", "시:23"));

        List<ChapterSummaryTarget> targets = targetProvider.getTargets();

        assertThat(targets)
            .containsExactly(
                new ChapterSummaryTarget("창", 2),
                new ChapterSummaryTarget("시", 23)
            );
    }

    @Test
    void getTargetsReturnsChaptersWithoutSummaryOrCandidateWhenAutoTargetsEnabled() {
        properties.setAutoTargetsEnabled(true);
        properties.setTargetLimit(2);

        BibleBook genesis = BibleBook.builder()
            .bookCode("창")
            .bookOrder(1)
            .build();
        BibleBook exodus = BibleBook.builder()
            .bookCode("출")
            .bookOrder(2)
            .build();

        when(bibleChapterRepository.findAllOrderByBookOrderAndChapterNum())
            .thenReturn(List.of(
                BibleChapter.builder().book(genesis).chapterNum(1).build(),
                BibleChapter.builder().book(genesis).chapterNum(2).build(),
                BibleChapter.builder().book(exodus).chapterNum(1).build()
            ));
        when(chapterSummaryRepository.existsByBookCodeAndChapterNum("창", 1))
            .thenReturn(true);
        when(chapterSummaryRepository.existsByBookCodeAndChapterNum("창", 2))
            .thenReturn(false);
        when(chapterSummaryCandidateRepository.existsByBookCodeAndChapterNum("창", 2))
            .thenReturn(true);
        when(chapterSummaryRepository.existsByBookCodeAndChapterNum("출", 1))
            .thenReturn(false);
        when(chapterSummaryCandidateRepository.existsByBookCodeAndChapterNum("출", 1))
            .thenReturn(false);

        List<ChapterSummaryTarget> targets = targetProvider.getTargets();

        assertThat(targets)
            .containsExactly(new ChapterSummaryTarget("출", 1));
    }
}
