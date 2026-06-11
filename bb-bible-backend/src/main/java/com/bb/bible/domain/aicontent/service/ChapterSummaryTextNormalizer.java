package com.bb.bible.domain.aicontent.service;

import java.util.List;

public class ChapterSummaryTextNormalizer {

    private static final List<String> ALLOWED_ENDINGS_WITHOUT_PERIOD = List.of(
        "입니다",
        "줍니다",
        "다룹니다",
        "나타납니다",
        "나타냅니다",
        "가르칩니다",
        "묘사합니다",
        "전합니다"
    );

    private ChapterSummaryTextNormalizer() {
    }

    public static String normalize(String summary) {
        if (summary == null) {
            return null;
        }

        String trimmed = summary.trim();
        if (ALLOWED_ENDINGS_WITHOUT_PERIOD.stream().anyMatch(trimmed::endsWith)) {
            return trimmed + ".";
        }

        return trimmed;
    }
}
