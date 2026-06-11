package com.bb.bible.domain.highlight.dto;

import java.util.List;

public record HighlightSyncRequest(
    List<HighlightRequest> highlights
) {
}
