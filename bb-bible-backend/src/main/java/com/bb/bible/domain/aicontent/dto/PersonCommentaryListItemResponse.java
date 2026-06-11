package com.bb.bible.domain.aicontent.dto;

import java.util.List;

public record PersonCommentaryListItemResponse(
    String personCode,
    String name,
    String shortDescription,
    List<String> keywords
) {
}
