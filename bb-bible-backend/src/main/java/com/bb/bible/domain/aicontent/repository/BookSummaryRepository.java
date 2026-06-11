package com.bb.bible.domain.aicontent.repository;

import com.bb.bible.domain.aicontent.entity.BookSummary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BookSummaryRepository extends JpaRepository<BookSummary, Long> {
    Optional<BookSummary> findByBookCode(String bookCode);
}
