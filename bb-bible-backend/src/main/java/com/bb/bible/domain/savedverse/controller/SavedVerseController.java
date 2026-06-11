package com.bb.bible.domain.savedverse.controller;

import com.bb.bible.domain.savedverse.dto.SavedVerseRequest;
import com.bb.bible.domain.savedverse.dto.SavedVerseResponse;
import com.bb.bible.domain.savedverse.service.SavedVerseService;
import com.bb.bible.global.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/saved-verses")
@RequiredArgsConstructor
public class SavedVerseController {

    private final SavedVerseService savedVerseService;

    @GetMapping
    public List<SavedVerseResponse> getSavedVerses(
        @AuthenticationPrincipal JwtTokenProvider.AuthUser authUser
    ) {
        UUID userId = UUID.fromString(authUser.sub());
        return savedVerseService.getSavedVerses(userId);
    }

    @PostMapping
    public SavedVerseResponse createSavedVerse(
        @AuthenticationPrincipal JwtTokenProvider.AuthUser authUser,
        @RequestBody SavedVerseRequest request
    ) {
        return savedVerseService.createSavedVerse(
            UUID.fromString(authUser.sub()),
            authUser.email(),
            request
        );
    }

    @DeleteMapping("/{verseKey}")
    public void deleteSavedVerse(
        @AuthenticationPrincipal JwtTokenProvider.AuthUser authUser,
        @PathVariable String verseKey
    ) {
        savedVerseService.deleteSavedVerse(UUID.fromString(authUser.sub()), verseKey);
    }
}
