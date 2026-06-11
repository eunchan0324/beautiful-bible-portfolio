package com.bb.bible.domain.preference.dto;

import com.bb.bible.domain.preference.entity.ThemeMode;
import com.bb.bible.domain.preference.entity.UserPreference;

public record PreferenceResponse(
    String fontSize,
    ThemeMode themeMode,
    boolean showVerseNumbers
) {
    public static PreferenceResponse from(UserPreference userPreference) {
        return new PreferenceResponse(
            userPreference.getFontSize(),
            userPreference.getThemeMode(),
            userPreference.isShowVerseNumbers()
        );
    }
}
