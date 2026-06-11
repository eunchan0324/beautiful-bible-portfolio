package com.bb.bible.domain.bible.controller;

import com.bb.bible.domain.bible.dto.BibleBookResponse;
import com.bb.bible.domain.bible.dto.BibleChapterResponse;
import com.bb.bible.domain.bible.service.BibleBookService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bible/books")
@RequiredArgsConstructor
public class BibleBookController {

    private final BibleBookService bookService;

    @GetMapping
    public List<BibleBookResponse> getBooks() {
        return bookService.getBooks();
    }

    @GetMapping("/{bookCode}")
    public BibleBookResponse getBook(@PathVariable String bookCode) {
        return bookService.getBook(bookCode);
    }

    @GetMapping("/{bookCode}/chapters/{chapterNum}")
    public BibleChapterResponse getChapter(@PathVariable String bookCode, @PathVariable Integer chapterNum) {
        return bookService.getChapter(bookCode, chapterNum);
    }
}
