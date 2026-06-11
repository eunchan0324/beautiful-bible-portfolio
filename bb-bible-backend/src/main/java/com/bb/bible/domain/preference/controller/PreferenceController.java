package com.bb.bible.domain.preference.controller;

import com.bb.bible.domain.preference.dto.PreferenceResponse;
import com.bb.bible.domain.preference.dto.UpdatePreferenceRequest;
import com.bb.bible.domain.preference.service.PreferenceService;
import com.bb.bible.global.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/preferences")
@RequiredArgsConstructor
public class PreferenceController {
    private final PreferenceService preferenceService;

    @GetMapping
    public PreferenceResponse getPreference(@AuthenticationPrincipal JwtTokenProvider.AuthUser authUser) {
        return preferenceService.getPreference(UUID.fromString(authUser.sub()), authUser.email());
    }

    @PutMapping
    public PreferenceResponse updatePreference(
        @AuthenticationPrincipal JwtTokenProvider.AuthUser authUser,
        @RequestBody UpdatePreferenceRequest request
    ) {
        return preferenceService.updatePreference(UUID.fromString(authUser.sub()), authUser.email(), request);
    }
}
