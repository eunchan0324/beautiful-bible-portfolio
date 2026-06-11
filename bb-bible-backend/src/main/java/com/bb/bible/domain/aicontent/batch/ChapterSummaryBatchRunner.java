package com.bb.bible.domain.aicontent.batch;

import com.bb.bible.domain.aicontent.config.ChapterSummaryAiProperties;
import com.bb.bible.domain.aicontent.service.ChapterSummaryGenerationResult;
import com.bb.bible.domain.aicontent.service.ChapterSummaryGenerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "ai.chapter-summary", name = "enabled", havingValue = "true")
public class ChapterSummaryBatchRunner implements ApplicationRunner {

    private final ChapterSummaryAiProperties properties;
    private final ChapterSummaryTargetProvider chapterSummaryTargetProvider;
    private final ChapterSummaryGenerationService chapterSummaryGenerationService;

    @Override
    public void run(ApplicationArguments args) {
        List<ChapterSummaryTarget> targets = chapterSummaryTargetProvider.getTargets();

        if (targets.isEmpty()) {
            log.info("Chapter summary batch is enabled, but no targets were provided.");
            return;
        }

        log.info("Chapter summary batch started. targetCount={}", targets.size());

        for (int index = 0; index < targets.size(); index++) {
            ChapterSummaryTarget target = targets.get(index);
            try {
                ChapterSummaryGenerationResult result = chapterSummaryGenerationService.generate(
                    target.bookCode(),
                    target.chapterNum()
                );
                log.info(
                    "Chapter summary batch result: bookCode={}, chapterNum={}, saved={}, message={}",
                    result.bookCode(),
                    result.chapterNum(),
                    result.saved(),
                    result.message()
                );
            } catch (Exception e) {
                log.warn(
                    "Chapter summary batch failed for target: bookCode={}, chapterNum={}, message={}",
                    target.bookCode(),
                    target.chapterNum(),
                    e.getMessage()
                );
            }

            waitBeforeNextTarget(index, targets.size());
        }
    }

    private void waitBeforeNextTarget(int currentIndex, int targetCount) {
        if (currentIndex >= targetCount - 1 || properties.getRequestDelayMillis() <= 0) {
            return;
        }

        try {
            log.info(
                "Chapter summary batch waiting before next target. delayMillis={}",
                properties.getRequestDelayMillis()
            );
            Thread.sleep(properties.getRequestDelayMillis());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Chapter summary batch interrupted while waiting", e);
        }
    }
}
