package com.bb.bible.domain.bible.service;

import com.bb.bible.domain.bible.dto.BibleBookResponse;
import com.bb.bible.domain.bible.dto.BibleChapterResponse;
import com.bb.bible.domain.bible.dto.BibleVerseResponse;
import com.bb.bible.domain.bible.entity.BibleBook;
import com.bb.bible.domain.bible.entity.BibleChapter;
import com.bb.bible.domain.bible.entity.BibleVerse;
import com.bb.bible.domain.bible.repository.BibleBookRepository;
import com.bb.bible.domain.bible.repository.BibleChapterRepository;
import com.bb.bible.domain.bible.repository.BibleVerseRepository;
import com.bb.bible.global.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BibleBookService {

    private final BibleBookRepository bookRepository;
    private final BibleChapterRepository chapterRepository;
    private final BibleVerseRepository verseRepository;

    public List<BibleBookResponse> getBooks() {
        return bookRepository.findAll().stream()
            .map(book -> new BibleBookResponse(
                book.getBookCode(),
                book.getNameKorean(),
                book.getTestament(),
                book.getBookOrder(),
                book.getChapterCount()
            ))
            .toList();
    }

    public BibleBookResponse getBook(String bookCode) {
        BibleBook book = bookRepository.findByBookCode(bookCode)
            .orElseThrow(() -> new NotFoundException("Bible book not found"));

        return new BibleBookResponse(
            book.getBookCode(),
            book.getNameKorean(),
            book.getTestament(),
            book.getBookOrder(),
            book.getChapterCount()
        );
    }

    public BibleChapterResponse getChapter(String bookCode, Integer chapterNum) {
        BibleChapter chapter = chapterRepository.findByBook_BookCodeAndChapterNum(bookCode, chapterNum)
            .orElseThrow(() -> new NotFoundException("Bible chapter not found"));

        List<BibleVerse> verses = verseRepository.findByChapterId(chapter.getId());

        List<BibleVerseResponse> verseResponses = verses.stream()
            .map(v -> new BibleVerseResponse(v.getVerseNum(), v.getVerseText(), v.getVerseKey()))
            .toList();

        return new BibleChapterResponse(chapterNum, verseResponses);
    }
}
