package com.bb.bible.domain.aicontent.dto;

import java.util.List;

public record PersonCommentaryDetailResponse(
    String personCode,
    String name,
    String shortDescription,
    String description,
    List<PersonStoryStepResponse> storyFlow,
    List<PersonKeyVerseResponse> keyVerses,
    List<String> relatedBooks,
    List<String> keywords
) {
}
