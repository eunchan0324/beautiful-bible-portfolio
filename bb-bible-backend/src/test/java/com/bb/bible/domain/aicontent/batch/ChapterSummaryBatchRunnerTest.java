package com.bb.bible.domain.aicontent.batch;

import com.bb.bible.domain.aicontent.config.ChapterSummaryAiProperties;
import com.bb.bible.domain.aicontent.service.ChapterSummaryGenerationResult;
import com.bb.bible.domain.aicontent.service.ChapterSummaryGenerationService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.DefaultApplicationArguments;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ChapterSummaryBatchRunnerTest {

    @Test
    void runContinuesWhenOneTargetFails() {
        ChapterSummaryAiProperties properties = new ChapterSummaryAiProperties();
        ChapterSummaryTargetProvider targetProvider = mock(ChapterSummaryTargetProvider.class);
        ChapterSummaryGenerationService generationService = mock(ChapterSummaryGenerationService.class);
        ChapterSummaryBatchRunner runner = new ChapterSummaryBatchRunner(
            properties,
            targetProvider,
            generationService
        );

        when(targetProvider.getTargets())
            .thenReturn(List.of(
                new ChapterSummaryTarget("창", 2),
                new ChapterSummaryTarget("창", 3)
            ));
        when(generationService.generate("창", 2))
            .thenThrow(new IllegalStateException("rate limit"));
        when(generationService.generate("창", 3))
            .thenReturn(ChapterSummaryGenerationResult.saved("창", 3));

        assertThatNoException()
            .isThrownBy(() -> runner.run(new DefaultApplicationArguments()));
    }
}
