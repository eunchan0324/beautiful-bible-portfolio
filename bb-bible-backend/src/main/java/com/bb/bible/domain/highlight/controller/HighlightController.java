package com.bb.bible.domain.highlight.controller;

import com.bb.bible.domain.highlight.dto.HighlightRequest;
import com.bb.bible.domain.highlight.dto.HighlightResponse;
import com.bb.bible.domain.highlight.dto.HighlightSyncRequest;
import com.bb.bible.domain.highlight.service.HighlightService;
import com.bb.bible.global.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/highlights")
@RequiredArgsConstructor
public class HighlightController {

    private final HighlightService highlightService;

    @GetMapping
    public List<HighlightResponse> getHighlights(
        @AuthenticationPrincipal JwtTokenProvider.AuthUser authUser
    ) {
        UUID userId = UUID.fromString(authUser.sub());
        return highlightService.getHighlights(userId);
    }

    @PostMapping
    public HighlightResponse createHighlight(
        @AuthenticationPrincipal JwtTokenProvider.AuthUser authUser,
        @RequestBody HighlightRequest request
    ) {
        return highlightService.createHighlight(UUID.fromString(authUser.sub()), authUser.email(), request);
    }

    @PutMapping("/{verseKey}")
    public HighlightResponse updateHighlight(
        @AuthenticationPrincipal JwtTokenProvider.AuthUser authUser,
        @PathVariable String verseKey,
        @RequestBody HighlightRequest request
    ) {
        return highlightService.updateHighlight(UUID.fromString(authUser.sub()), verseKey, request);
    }

    @DeleteMapping("/{verseKey}")
    public void deleteHighlight(
        @AuthenticationPrincipal JwtTokenProvider.AuthUser authUser,
        @PathVariable String verseKey
    ) {
        highlightService.deleteHighlight(UUID.fromString(authUser.sub()), verseKey);
    }

    @PostMapping("/sync")
    public List<HighlightResponse> syncHighlights(
        @AuthenticationPrincipal JwtTokenProvider.AuthUser authUser,
        @RequestBody HighlightSyncRequest request
    ) {
        return highlightService.syncHighlights(
            UUID.fromString(authUser.sub()),
            authUser.email(),
            request
        );
    }
}
