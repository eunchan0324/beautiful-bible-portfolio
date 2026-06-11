package com.bb.bible.domain.aicontent.service;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChapterSummaryValidationService {

    private static final int MIN_LENGTH = 40;
    private static final int MAX_LENGTH = 120;

    private static final List<String> ALLOWED_ENDINGS = List.of(
        "입니다.",
        "줍니다.",
        "다룹니다.",
        "나타납니다.",
        "나타냅니다.",
        "가르칩니다.",
        "묘사합니다.",
        "전합니다."
    );

    private static final List<String> FORBIDDEN_STARTS = List.of(
        "이 장은",
        "본 장은"
    );

    private static final List<String> FORBIDDEN_KEYWORDS = List.of(
        "해야 합니다",
        "합시다",
        "우리",
        "성도",
        "독자",
        "묵상",
        "적용"
    );

    public ChapterSummaryValidationResult validate(String summary) {
        if (summary == null || summary.isBlank()) {
            return ChapterSummaryValidationResult.rejected("summary is empty");
        }

        String trimmed = summary.trim();
        int length = trimmed.length();
        if (length < MIN_LENGTH || length > MAX_LENGTH) {
            return ChapterSummaryValidationResult.rejected("summary length must be between 40 and 120 characters");
        }

        if (FORBIDDEN_STARTS.stream().anyMatch(trimmed::startsWith)) {
            return ChapterSummaryValidationResult.rejected("summary starts with a forbidden phrase");
        }

        if (ALLOWED_ENDINGS.stream().noneMatch(trimmed::endsWith)) {
            return ChapterSummaryValidationResult.rejected("summary ending is not allowed");
        }

        if (FORBIDDEN_KEYWORDS.stream().anyMatch(trimmed::contains)) {
            return ChapterSummaryValidationResult.rejected("summary contains a forbidden keyword");
        }

        return ChapterSummaryValidationResult.accepted();
    }
}
