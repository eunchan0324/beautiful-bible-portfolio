package com.bb.bible.domain.aicontent.service;

import com.bb.bible.domain.aicontent.client.ChapterSummaryAiClient;
import com.bb.bible.domain.aicontent.client.ChapterSummaryAiRequest;
import com.bb.bible.domain.aicontent.client.ChapterSummaryAiResponse;
import com.bb.bible.domain.aicontent.client.ChapterSummaryReviewClient;
import com.bb.bible.domain.aicontent.client.ChapterSummaryReviewRequest;
import com.bb.bible.domain.aicontent.client.ChapterSummaryReviewResponse;
import com.bb.bible.domain.aicontent.config.ChapterSummaryAiProperties;
import com.bb.bible.domain.aicontent.entity.ChapterSummaryCandidate;
import com.bb.bible.domain.aicontent.entity.ChapterSummaryReviewDecision;
import com.bb.bible.domain.aicontent.repository.ChapterSummaryCandidateRepository;
import com.bb.bible.domain.aicontent.repository.ChapterSummaryRepository;
import com.bb.bible.domain.bible.entity.BibleBook;
import com.bb.bible.domain.bible.entity.BibleChapter;
import com.bb.bible.domain.bible.entity.BibleVerse;
import com.bb.bible.domain.bible.repository.BibleChapterRepository;
import com.bb.bible.domain.bible.repository.BibleVerseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChapterSummaryGenerationServiceTest {

    @Mock
    private BibleChapterRepository bibleChapterRepository;

    @Mock
    private BibleVerseRepository bibleVerseRepository;

    @Mock
    private ChapterSummaryRepository chapterSummaryRepository;

    @Mock
    private ChapterSummaryCandidateRepository chapterSummaryCandidateRepository;

    @Mock
    private ChapterSummaryAiClient chapterSummaryAiClient;

    @Mock
    private ChapterSummaryReviewClient chapterSummaryReviewClient;

    private ChapterSummaryGenerationService generationService;
    private ChapterSummaryAiProperties properties;

    @BeforeEach
    void setUp() {
        properties = new ChapterSummaryAiProperties();
        generationService = new ChapterSummaryGenerationService(
            bibleChapterRepository,
            bibleVerseRepository,
            chapterSummaryRepository,
            chapterSummaryCandidateRepository,
            chapterSummaryAiClient,
            chapterSummaryReviewClient,
            new ChapterSummaryValidationService(),
            properties
        );
    }

    @Test
    void generateBuildsChapterTextAndSavesCandidate() {
        BibleChapter chapter = createChapter("창", "창세기", 1L, 1);
        List<BibleVerse> verses = List.of(
            BibleVerse.builder().verseNum(1).verseText("샘플 구절 본문입니다").build(),
            BibleVerse.builder().verseNum(2).verseText("두 번째 샘플 구절입니다").build()
        );

        when(chapterSummaryRepository.findByBookCodeAndChapterNum("창", 1))
            .thenReturn(Optional.empty());
        when(chapterSummaryCandidateRepository.existsByBookCodeAndChapterNum("창", 1))
            .thenReturn(false);
        when(bibleChapterRepository.findByBook_BookCodeAndChapterNum("창", 1))
            .thenReturn(Optional.of(chapter));
        when(bibleVerseRepository.findByChapterIdOrderByVerseNumAsc(1L))
            .thenReturn(verses);
        when(chapterSummaryAiClient.generate(any(ChapterSummaryAiRequest.class)))
            .thenReturn(new ChapterSummaryAiResponse(
                "하나님이 천지를 창조하시고 빛과 어둠을 나누어 질서를 세우시는 장입니다.",
                "test-generation-model"
            ));
        when(chapterSummaryReviewClient.review(any(ChapterSummaryReviewRequest.class)))
            .thenReturn(new ChapterSummaryReviewResponse(
                ChapterSummaryReviewDecision.PASS,
                "자연스러운 한국어 문장입니다.",
                "test-review-model"
            ));

        ChapterSummaryGenerationResult result = generationService.generate("창", 1);

        assertThat(result.saved()).isTrue();

        ArgumentCaptor<ChapterSummaryAiRequest> requestCaptor =
            ArgumentCaptor.forClass(ChapterSummaryAiRequest.class);
        verify(chapterSummaryAiClient).generate(requestCaptor.capture());
        assertThat(requestCaptor.getValue().chapterText())
            .contains("1 샘플 구절 본문입니다")
            .contains("2 두 번째 샘플 구절입니다");

        ArgumentCaptor<ChapterSummaryCandidate> candidateCaptor =
            ArgumentCaptor.forClass(ChapterSummaryCandidate.class);
        verify(chapterSummaryCandidateRepository).save(candidateCaptor.capture());
        ChapterSummaryCandidate candidate = candidateCaptor.getValue();
        assertThat(candidate.getBookCode()).isEqualTo("창");
        assertThat(candidate.getChapterNum()).isEqualTo(1);
        assertThat(candidate.getSummary()).isEqualTo("하나님이 천지를 창조하시고 빛과 어둠을 나누어 질서를 세우시는 장입니다.");
        assertThat(candidate.getGenerationModel()).isEqualTo("test-generation-model");
        assertThat(candidate.getReviewDecision()).isEqualTo(ChapterSummaryReviewDecision.PASS);
        assertThat(candidate.getReviewReason()).isEqualTo("자연스러운 한국어 문장입니다.");
        assertThat(candidate.getReviewModel()).isEqualTo("test-review-model");
        verify(chapterSummaryRepository, never()).save(any());
    }

    @Test
    void generateSkipsWhenConfirmedSummaryAlreadyExists() {
        when(chapterSummaryRepository.findByBookCodeAndChapterNum("창", 1))
            .thenReturn(Optional.of(com.bb.bible.domain.aicontent.entity.ChapterSummary.builder().build()));

        ChapterSummaryGenerationResult result = generationService.generate("창", 1);

        assertThat(result.saved()).isFalse();
        assertThat(result.message()).isEqualTo("summary already exists");
        verify(chapterSummaryAiClient, never()).generate(any());
    }

    @Test
    void generateSkipsWhenCandidateAlreadyExists() {
        when(chapterSummaryRepository.findByBookCodeAndChapterNum("창", 1))
            .thenReturn(Optional.empty());
        when(chapterSummaryCandidateRepository.existsByBookCodeAndChapterNum("창", 1))
            .thenReturn(true);

        ChapterSummaryGenerationResult result = generationService.generate("창", 1);

        assertThat(result.saved()).isFalse();
        assertThat(result.message()).isEqualTo("summary candidate already exists");
        verify(chapterSummaryAiClient, never()).generate(any());
    }

    @Test
    void generateSavesReviewCandidateWhenSummaryFailsRuleValidation() {
        BibleChapter chapter = createChapter("창", "창세기", 1L, 1);

        when(chapterSummaryRepository.findByBookCodeAndChapterNum("창", 1))
            .thenReturn(Optional.empty());
        when(chapterSummaryCandidateRepository.existsByBookCodeAndChapterNum("창", 1))
            .thenReturn(false);
        when(bibleChapterRepository.findByBook_BookCodeAndChapterNum("창", 1))
            .thenReturn(Optional.of(chapter));
        when(bibleVerseRepository.findByChapterIdOrderByVerseNumAsc(1L))
            .thenReturn(List.of(BibleVerse.builder().verseNum(1).verseText("샘플 본문입니다.").build()));
        when(chapterSummaryAiClient.generate(any(ChapterSummaryAiRequest.class)))
            .thenReturn(new ChapterSummaryAiResponse("짧은 요약입니다.", "test-model"));

        ChapterSummaryGenerationResult result = generationService.generate("창", 1);

        assertThat(result.saved()).isTrue();
        ArgumentCaptor<ChapterSummaryCandidate> candidateCaptor =
            ArgumentCaptor.forClass(ChapterSummaryCandidate.class);
        verify(chapterSummaryCandidateRepository).save(candidateCaptor.capture());
        ChapterSummaryCandidate candidate = candidateCaptor.getValue();
        assertThat(candidate.getSummary()).isEqualTo("짧은 요약입니다.");
        assertThat(candidate.getGenerationModel()).isEqualTo("test-model");
        assertThat(candidate.getReviewDecision()).isEqualTo(ChapterSummaryReviewDecision.REVIEW);
        assertThat(candidate.getReviewReason()).isEqualTo("summary length must be between 40 and 120 characters");
        assertThat(candidate.getReviewModel()).isEqualTo("rule-validation");
        verify(chapterSummaryReviewClient, never()).review(any());
    }

    @Test
    void generateRetriesOnceWhenFirstSummaryIsInvalid() {
        BibleChapter chapter = createChapter("시", "시편", 23L, 23);

        when(chapterSummaryRepository.findByBookCodeAndChapterNum("시", 23))
            .thenReturn(Optional.empty());
        when(chapterSummaryCandidateRepository.existsByBookCodeAndChapterNum("시", 23))
            .thenReturn(false);
        when(bibleChapterRepository.findByBook_BookCodeAndChapterNum("시", 23))
            .thenReturn(Optional.of(chapter));
        when(bibleVerseRepository.findByChapterIdOrderByVerseNumAsc(23L))
            .thenReturn(List.of(BibleVerse.builder().verseNum(1).verseText("테스트 본문입니다.").build()));
        when(chapterSummaryAiClient.generate(any(ChapterSummaryAiRequest.class)))
            .thenReturn(new ChapterSummaryAiResponse("여호와는 목자로 보호해 줍니다.", "test-model"))
            .thenReturn(new ChapterSummaryAiResponse(
                "여호와는 목자로 부족함이 없게 하시고 사망의 골짜기에서도 안위해 주심을 보여 줍니다.",
                "test-model"
            ));
        when(chapterSummaryReviewClient.review(any(ChapterSummaryReviewRequest.class)))
            .thenReturn(new ChapterSummaryReviewResponse(
                ChapterSummaryReviewDecision.PASS,
                "자연스러운 한국어 문장입니다.",
                "test-review-model"
            ));

        ChapterSummaryGenerationResult result = generationService.generate("시", 23);

        assertThat(result.saved()).isTrue();

        ArgumentCaptor<ChapterSummaryAiRequest> requestCaptor =
            ArgumentCaptor.forClass(ChapterSummaryAiRequest.class);
        verify(chapterSummaryAiClient, times(2)).generate(requestCaptor.capture());
        assertThat(requestCaptor.getAllValues().get(1).retryReason())
            .isEqualTo("summary length must be between 40 and 120 characters: 여호와는 목자로 보호해 줍니다.");
        verify(chapterSummaryCandidateRepository).save(any());
    }

    private BibleChapter createChapter(String bookCode, String bookName, Long chapterId, Integer chapterNum) {
        BibleBook book = BibleBook.builder()
            .bookCode(bookCode)
            .nameKorean(bookName)
            .build();
        return BibleChapter.builder()
            .id(chapterId)
            .book(book)
            .chapterNum(chapterNum)
            .build();
    }
}
