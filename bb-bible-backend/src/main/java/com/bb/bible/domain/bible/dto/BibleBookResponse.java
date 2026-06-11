package com.bb.bible.domain.bible.dto;

import com.bb.bible.domain.bible.entity.Testament;

public record BibleBookResponse(
    String bookCode,

    String nameKorean,

    Testament testament,

    Integer bookOrder,

    Integer chapterCount
) {
}
