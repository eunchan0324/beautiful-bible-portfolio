package com.bb.bible.domain.aicontent.service;

import com.bb.bible.domain.aicontent.dto.BookSummaryResponse;
import com.bb.bible.domain.aicontent.entity.BookSummary;
import com.bb.bible.domain.aicontent.repository.BookSummaryRepository;
import com.bb.bible.global.exception.NotFoundException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookSummaryService {

    private final BookSummaryRepository bookSummaryRepository;
    private final ObjectMapper objectMapper;

    public BookSummaryResponse getBookSummary(String bookCode) {
        BookSummary bookSummary = bookSummaryRepository.findByBookCode(bookCode)
            .orElseThrow(() -> new NotFoundException("Book summary not found"));

        return new BookSummaryResponse(
            bookSummary.getBookCode(),
            bookSummary.getShortSummary(),
            bookSummary.getSummary(),
            bookSummary.getReadingPoint(),
            parseList(bookSummary.getKeywords()),
            parseList(bookSummary.getOutline()),
            bookSummary.getModel()
        );
    }

    private List<String> parseList(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse book summary list field", e);
        }
    }
}
