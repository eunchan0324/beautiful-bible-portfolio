package com.bb.bible.domain.readingplan.controller;

import com.bb.bible.domain.readingplan.dto.CompleteReadingChapterRequest;
import com.bb.bible.domain.readingplan.dto.CompleteReadingChapterResponse;
import com.bb.bible.domain.readingplan.dto.CreateReadingPlanRequest;
import com.bb.bible.domain.readingplan.dto.CreateReadingPlanResponse;
import com.bb.bible.domain.readingplan.dto.ReadingPlanResponse;
import com.bb.bible.domain.readingplan.service.ReadingPlanService;
import com.bb.bible.global.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reading-plans")
@RequiredArgsConstructor
public class ReadingPlanController {

    private final ReadingPlanService readingPlanService;

    @PostMapping
    public CreateReadingPlanResponse createReadingPlan(
        @AuthenticationPrincipal JwtTokenProvider.AuthUser authUser,
        @RequestBody CreateReadingPlanRequest request
    ) {
        return readingPlanService.createReadingPlan(
            UUID.fromString(authUser.sub()),
            authUser.email(),
            request
        );
    }

    @GetMapping("/me")
    public ReadingPlanResponse getMyReadingPlan(
        @AuthenticationPrincipal JwtTokenProvider.AuthUser authUser
    ) {
        return readingPlanService.getMyReadingPlan(UUID.fromString(authUser.sub()));
    }

    @DeleteMapping("/{planId}")
    public void deleteReadingPlan(
        @AuthenticationPrincipal JwtTokenProvider.AuthUser authUser,
        @PathVariable Long planId
    ) {
        readingPlanService.deleteReadingPlan(
            UUID.fromString(authUser.sub()),
            planId
        );
    }

    @PostMapping("/{planId}/progress")
    public CompleteReadingChapterResponse completeChapter(
        @AuthenticationPrincipal JwtTokenProvider.AuthUser authUser,
        @PathVariable Long planId,
        @RequestBody CompleteReadingChapterRequest request
    ) {
        return readingPlanService.completeChapter(
            UUID.fromString(authUser.sub()),
            planId,
            request
        );
    }
}
