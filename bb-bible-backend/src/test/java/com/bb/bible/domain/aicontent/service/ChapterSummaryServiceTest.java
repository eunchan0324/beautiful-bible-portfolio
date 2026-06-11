package com.bb.bible.domain.aicontent.service;

import com.bb.bible.domain.aicontent.dto.ChapterSummaryResponse;
import com.bb.bible.domain.aicontent.entity.ChapterSummary;
import com.bb.bible.domain.aicontent.repository.ChapterSummaryRepository;
import com.bb.bible.global.exception.NotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChapterSummaryServiceTest {

    @Mock
    private ChapterSummaryRepository chapterSummaryRepository;

    @InjectMocks
    private ChapterSummaryService chapterSummaryService;

    @Test
    void getChapterSummaryReturnsSummary() {
        ChapterSummary chapterSummary = ChapterSummary.builder()
            .bookCode("창")
            .chapterNum(1)
            .summary("하나님이 천지를 창조하시는 장입니다.")
            .model("manual-sample")
            .build();

        when(chapterSummaryRepository.findByBookCodeAndChapterNum("창", 1))
            .thenReturn(Optional.of(chapterSummary));

        ChapterSummaryResponse response = chapterSummaryService.getChapterSummary("창", 1);

        assertThat(response.bookCode()).isEqualTo("창");
        assertThat(response.chapterNum()).isEqualTo(1);
        assertThat(response.summary()).isEqualTo("하나님이 천지를 창조하시는 장입니다.");
        assertThat(response.model()).isEqualTo("manual-sample");
    }

    @Test
    void getChapterSummaryThrowsNotFoundWhenSummaryDoesNotExist() {
        when(chapterSummaryRepository.findByBookCodeAndChapterNum("창", 2))
            .thenReturn(Optional.empty());

        assertThatThrownBy(() -> chapterSummaryService.getChapterSummary("창", 2))
            .isInstanceOf(NotFoundException.class)
            .hasMessage("Chapter summary not found");
    }
}
