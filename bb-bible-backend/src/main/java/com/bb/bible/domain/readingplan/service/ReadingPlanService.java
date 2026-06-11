package com.bb.bible.domain.readingplan.service;

import com.bb.bible.domain.bible.entity.BibleBook;
import com.bb.bible.domain.bible.repository.BibleBookRepository;
import com.bb.bible.domain.readingplan.dto.CompleteReadingChapterRequest;
import com.bb.bible.domain.readingplan.dto.CompleteReadingChapterResponse;
import com.bb.bible.domain.readingplan.dto.CreateReadingPlanRequest;
import com.bb.bible.domain.readingplan.dto.CreateReadingPlanResponse;
import com.bb.bible.domain.readingplan.dto.ReadingPlanItemResponse;
import com.bb.bible.domain.readingplan.dto.ReadingProgressResponse;
import com.bb.bible.domain.readingplan.dto.ReadingPlanResponse;
import com.bb.bible.domain.readingplan.entity.ReadingPlan;
import com.bb.bible.domain.readingplan.entity.ReadingPlanItem;
import com.bb.bible.domain.readingplan.entity.ReadingPlanStatus;
import com.bb.bible.domain.readingplan.entity.ReadingProgress;
import com.bb.bible.domain.readingplan.repository.ReadingPlanItemRepository;
import com.bb.bible.domain.readingplan.repository.ReadingPlanRepository;
import com.bb.bible.domain.readingplan.repository.ReadingProgressRepository;
import com.bb.bible.domain.user.entity.User;
import com.bb.bible.domain.user.service.UserService;
import com.bb.bible.global.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReadingPlanService {

    private final ReadingPlanRepository readingPlanRepository;
    private final ReadingPlanItemRepository readingPlanItemRepository;
    private final ReadingProgressRepository readingProgressRepository;
    private final BibleBookRepository bookRepository;
    private final UserService userService;

    @Transactional
    public CreateReadingPlanResponse createReadingPlan(UUID userId, String email, CreateReadingPlanRequest request) {
        validateRequest(request);

        User user = userService.getOrCreate(userId, email);

        if (readingPlanRepository.existsByUserIdAndStatus(userId, ReadingPlanStatus.IN_PROGRESS)) {
            throw new DataIntegrityViolationException("Reading plan already exists");
        }

        List<BibleBook> bibleBooks = bookRepository.findByBookCodeInOrderByBookOrderAsc(request.bookCodes());

        if (bibleBooks.size() != request.bookCodes().size()) {
            throw new NotFoundException("Bible book not found");
        }

        ReadingPlan readingPlan = ReadingPlan.builder()
            .user(user)
            .title(request.title())
            .startDate(request.startDate())
            .dailyChapterTarget(request.dailyChapterTarget())
            .build();

        ReadingPlan savedPlan = readingPlanRepository.save(readingPlan);

        List<ReadingPlanItem> items = new ArrayList<>();
        int itemOrder = 1;

        for (BibleBook book : bibleBooks) {
            for (int chapterNum = 1; chapterNum <= book.getChapterCount(); chapterNum++) {
                int dayNumber = ((itemOrder - 1) / request.dailyChapterTarget()) + 1;

                ReadingPlanItem item = ReadingPlanItem.builder()
                    .plan(savedPlan)
                    .dayNumber(dayNumber)
                    .bookCode(book.getBookCode())
                    .chapterNum(chapterNum)
                    .itemOrder(itemOrder)
                    .build();

                items.add(item);
                itemOrder++;
            }
        }

        readingPlanItemRepository.saveAll(items);

        return new CreateReadingPlanResponse(
            savedPlan.getId(),
            savedPlan.getTitle(),
            savedPlan.getStartDate(),
            savedPlan.getDailyChapterTarget(),
            savedPlan.getStatus()
        );
    }

    @Transactional(readOnly = true)
    public ReadingPlanResponse getMyReadingPlan(UUID userId) {
        ReadingPlan plan = readingPlanRepository
            .findByUserIdAndStatus(userId, ReadingPlanStatus.IN_PROGRESS)
            .orElseThrow(() -> new NotFoundException("Reading plan not found"));

        List<ReadingPlanItemResponse> items = readingPlanItemRepository
            .findByPlanIdOrderByItemOrderAsc(plan.getId())
            .stream()
            .map(item -> new ReadingPlanItemResponse(
                item.getDayNumber(),
                item.getBookCode(),
                item.getChapterNum(),
                item.getItemOrder()
            ))
            .toList();

        List<ReadingProgressResponse> completedChapters = readingProgressRepository
            .findByReadingPlanIdAndUserId(plan.getId(), userId)
            .stream()
            .map(progress -> new ReadingProgressResponse(
                progress.getBookCode(),
                progress.getChapterNum(),
                progress.getCompletedAt()
            ))
            .toList();

        return new ReadingPlanResponse(
            plan.getId(),
            plan.getTitle(),
            plan.getStartDate(),
            plan.getDailyChapterTarget(),
            plan.getStatus(),
            items,
            completedChapters
        );
    }

    @Transactional
    public void deleteReadingPlan(UUID userId, Long planId) {
        ReadingPlan plan = readingPlanRepository.findById(planId)
            .orElseThrow(() -> new NotFoundException("Reading plan not found"));

        if (!plan.getUser().getId().equals(userId)) {
            throw new NotFoundException("Reading plan not found");
        }

        readingPlanRepository.delete(plan);
    }

    @Transactional
    public CompleteReadingChapterResponse completeChapter(UUID userId, Long planId, CompleteReadingChapterRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request is required");
        }

        if (request.bookCode() == null || request.bookCode().isBlank()) {
            throw new IllegalArgumentException("Book code is required");
        }

        if (request.chapterNum() == null || request.chapterNum() < 1) {
            throw new IllegalArgumentException("Chapter number must be positive");
        }

        ReadingPlan plan = readingPlanRepository.findById(planId)
            .orElseThrow(() -> new NotFoundException("Reading plan not found"));

        if (!plan.getUser().getId().equals(userId)) {
            throw new NotFoundException("Reading plan not found");
        }

        boolean included = readingPlanItemRepository.existsByPlanIdAndBookCodeAndChapterNum(
            planId,
            request.bookCode(),
            request.chapterNum()
        );
        if (!included) {
            throw new NotFoundException("Reading plan item not found");
        }

        boolean alreadyCompleted = readingProgressRepository.existsByReadingPlanIdAndUserIdAndBookCodeAndChapterNum(
            planId,
            userId,
            request.bookCode(),
            request.chapterNum()
        );

        if (alreadyCompleted) {
            throw new DataIntegrityViolationException("Reading progress already exists");
        }

        ReadingProgress progress = ReadingProgress.builder()
            .readingPlan(plan)
            .user(plan.getUser())
            .bookCode(request.bookCode())
            .chapterNum(request.chapterNum())
            .build();

        ReadingProgress savedProgress = readingProgressRepository.save(progress);
        long totalItemCount = readingPlanItemRepository.countByPlanId(planId);
        long completedItemCount = readingProgressRepository.countByReadingPlanIdAndUserId(planId, userId);

        if (totalItemCount > 0 && completedItemCount >= totalItemCount) {
            plan.complete();
        }

        return new CompleteReadingChapterResponse(
            plan.getId(),
            savedProgress.getBookCode(),
            savedProgress.getChapterNum(),
            savedProgress.getCompletedAt()
        );
    }

    private void validateRequest(CreateReadingPlanRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request is required");
        }

        if (request.title() == null || request.title().isBlank()) {
            throw new IllegalArgumentException("Title is required");
        }

        if (request.bookCodes() == null || request.bookCodes().isEmpty()) {
            throw new IllegalArgumentException("Reading plan requires at least one book");
        }

        if (request.bookCodes().stream().distinct().count() != request.bookCodes().size()) {
            throw new IllegalArgumentException("Duplicate bible book code");
        }

        if (request.dailyChapterTarget() == null || request.dailyChapterTarget() < 1 || request.dailyChapterTarget() > 10) {
            throw new IllegalArgumentException("Daily chapter target must be between 1 and 10");
        }

        if (request.startDate() == null) {
            throw new IllegalArgumentException("Start date is required");
        }
    }
}
