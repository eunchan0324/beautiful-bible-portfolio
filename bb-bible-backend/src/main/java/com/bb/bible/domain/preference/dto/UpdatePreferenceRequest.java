package com.bb.bible.domain.preference.dto;

import com.bb.bible.domain.preference.entity.ThemeMode;

public record UpdatePreferenceRequest(
    String fontSize,
    ThemeMode themeMode,
    boolean showVerseNumbers
) {
}
