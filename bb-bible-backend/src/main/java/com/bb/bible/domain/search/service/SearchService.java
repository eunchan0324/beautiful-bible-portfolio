package com.bb.bible.domain.search.service;

import com.bb.bible.domain.bible.entity.BibleVerse;
import com.bb.bible.domain.bible.repository.BibleVerseRepository;
import com.bb.bible.domain.search.dto.SearchVerseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final BibleVerseRepository verseRepository;

    @Transactional(readOnly = true)
    public Page<SearchVerseResponse> searchVerses(String query, Pageable pageable) {
        if (query == null || query.trim().isEmpty()) {
            return Page.empty(pageable);
        }

        String keyword = query.trim();

        return verseRepository.searchByFullText(keyword, pageable)
            .map(this::toResponse);
    }

    private SearchVerseResponse toResponse(BibleVerse verse) {
        var chapter = verse.getChapter();
        var book = chapter.getBook();

        return new SearchVerseResponse(
            verse.getVerseKey(),
            book.getBookCode(),
            book.getNameKorean(),
            chapter.getChapterNum(),
            verse.getVerseNum(),
            verse.getVerseText()
        );
    }
}
