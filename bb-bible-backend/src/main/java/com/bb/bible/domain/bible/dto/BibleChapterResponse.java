package com.bb.bible.domain.bible.dto;

import java.util.List;

public record BibleChapterResponse(
    Integer chapterNum,
    List<BibleVerseResponse> verses
) {
}
