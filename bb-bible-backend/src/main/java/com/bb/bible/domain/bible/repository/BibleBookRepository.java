package com.bb.bible.domain.bible.repository;

import com.bb.bible.domain.bible.entity.BibleBook;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BibleBookRepository extends JpaRepository<BibleBook, Long> {
    Optional<BibleBook> findByBookCode(String bookCode);

    List<BibleBook> findByBookCodeInOrderByBookOrderAsc(List<String> bookCodes);
}
