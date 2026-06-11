package com.bb.bible.domain.highlight.service;

import com.bb.bible.domain.highlight.dto.HighlightRequest;
import com.bb.bible.domain.highlight.dto.HighlightResponse;
import com.bb.bible.domain.highlight.dto.HighlightSyncRequest;
import com.bb.bible.domain.highlight.entity.Highlight;
import com.bb.bible.domain.highlight.repository.HighlightRepository;
import com.bb.bible.domain.user.entity.User;
import com.bb.bible.domain.user.service.UserService;
import com.bb.bible.global.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HighlightService {

    private final HighlightRepository highlightRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<HighlightResponse> getHighlights(UUID userId) {
        return highlightRepository.findAllByUserId(userId).stream()
            .map(HighlightResponse::from)
            .toList();
    }

    @Transactional
    public HighlightResponse createHighlight(UUID userId, String email, HighlightRequest request) {
        User user = userService.getOrCreate(userId, email);

        Highlight highlight = Highlight.builder()
            .user(user)
            .verseKey(request.verseKey())
            .color(request.color())
            .note(request.note())
            .build();

        var savedHighlight = highlightRepository.save(highlight);

        return HighlightResponse.from(savedHighlight);
    }

    @Transactional
    public HighlightResponse updateHighlight(UUID userId, String verseKey, HighlightRequest request) {
        Highlight highlight = highlightRepository.findByUserIdAndVerseKey(userId, verseKey)
            .orElseThrow(() -> new NotFoundException("Highlight not found"));

        highlight.update(request.color(), request.note());

        return HighlightResponse.from(highlight);
    }

    @Transactional
    public void deleteHighlight(UUID userId, String verseKey) {
        highlightRepository.deleteByUserIdAndVerseKey(userId, verseKey);
    }

    @Transactional
    public List<HighlightResponse> syncHighlights(
        UUID userId,
        String email,
        HighlightSyncRequest request
    ) {
        User user = userService.getOrCreate(userId, email);

        for (HighlightRequest highlightRequest : request.highlights()) {
            Highlight highlight = highlightRepository
                .findByUserIdAndVerseKey(userId, highlightRequest.verseKey())
                .orElse(null);

            if (highlight == null) {
                Highlight newHighlight = Highlight.builder()
                    .user(user)
                    .verseKey(highlightRequest.verseKey())
                    .color(highlightRequest.color())
                    .note(highlightRequest.note())
                    .build();

                highlightRepository.save(newHighlight);
            } else {
                highlight.update(highlightRequest.color(), highlightRequest.note());
            }
        }

        return getHighlights(userId);
    }
}
