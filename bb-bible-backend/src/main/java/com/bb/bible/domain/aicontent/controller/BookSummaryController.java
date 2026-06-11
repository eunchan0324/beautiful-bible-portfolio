package com.bb.bible.domain.aicontent.controller;

import com.bb.bible.domain.aicontent.dto.BookSummaryResponse;
import com.bb.bible.domain.aicontent.service.BookSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bible/books")
@RequiredArgsConstructor
public class BookSummaryController {

    private final BookSummaryService bookSummaryService;

    @GetMapping("/{bookCode}/summary")
    public BookSummaryResponse getBookSummary(@PathVariable String bookCode) {
        return bookSummaryService.getBookSummary(bookCode);
    }
}
