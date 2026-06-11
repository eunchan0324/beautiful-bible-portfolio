package com.bb.bible.domain.aicontent.dto;

import java.util.List;

public record PersonStoryStepResponse(
    String title,
    String summary,
    List<String> verseKeys
) {
}
