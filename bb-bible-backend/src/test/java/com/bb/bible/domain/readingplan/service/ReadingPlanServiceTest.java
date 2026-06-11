package com.bb.bible.domain.readingplan.service;

import com.bb.bible.domain.bible.entity.BibleBook;
import com.bb.bible.domain.bible.entity.Testament;
import com.bb.bible.domain.bible.repository.BibleBookRepository;
import com.bb.bible.domain.readingplan.dto.CompleteReadingChapterRequest;
import com.bb.bible.domain.readingplan.dto.CompleteReadingChapterResponse;
import com.bb.bible.domain.readingplan.dto.CreateReadingPlanRequest;
import com.bb.bible.domain.readingplan.dto.CreateReadingPlanResponse;
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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReadingPlanServiceTest {

    private static final UUID USER_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final String EMAIL = "reader@example.com";

    @Mock
    private ReadingPlanRepository readingPlanRepository;

    @Mock
    private ReadingPlanItemRepository readingPlanItemRepository;

    @Mock
    private ReadingProgressRepository readingProgressRepository;

    @Mock
    private BibleBookRepository bookRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private ReadingPlanService readingPlanService;

    @Test
    void createReadingPlanSavesPlanAndItems() {
        User user = createUser();
        CreateReadingPlanRequest request = new CreateReadingPlanRequest(
            "요한복음 2장씩",
            List.of("요"),
            2,
            LocalDate.of(2026, 6, 9)
        );
        BibleBook john = createBook("요", "요한복음", 43, 3);
        ReadingPlan savedPlan = createPlan(10L, user, request.title(), request.startDate(), request.dailyChapterTarget());

        when(userService.getOrCreate(USER_ID, EMAIL)).thenReturn(user);
        when(readingPlanRepository.existsByUserIdAndStatus(USER_ID, ReadingPlanStatus.IN_PROGRESS)).thenReturn(false);
        when(bookRepository.findByBookCodeInOrderByBookOrderAsc(List.of("요"))).thenReturn(List.of(john));
        when(readingPlanRepository.save(any(ReadingPlan.class))).thenReturn(savedPlan);

        CreateReadingPlanResponse response = readingPlanService.createReadingPlan(USER_ID, EMAIL, request);

        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.title()).isEqualTo("요한복음 2장씩");
        assertThat(response.status()).isEqualTo(ReadingPlanStatus.IN_PROGRESS);

        ArgumentCaptor<Iterable<ReadingPlanItem>> itemsCaptor = iterableCaptor();
        verify(readingPlanItemRepository).saveAll(itemsCaptor.capture());
        List<ReadingPlanItem> items = toList(itemsCaptor.getValue());

        assertThat(items).hasSize(3);
        assertThat(items)
            .extracting(
                ReadingPlanItem::getBookCode,
                ReadingPlanItem::getChapterNum,
                ReadingPlanItem::getItemOrder,
                ReadingPlanItem::getDayNumber
            )
            .containsExactly(
                org.assertj.core.groups.Tuple.tuple("요", 1, 1, 1),
                org.assertj.core.groups.Tuple.tuple("요", 2, 2, 1),
                org.assertj.core.groups.Tuple.tuple("요", 3, 3, 2)
            );
    }

    @Test
    void createReadingPlanThrowsConflictWhenInProgressPlanExists() {
        CreateReadingPlanRequest request = new CreateReadingPlanRequest(
            "요한복음 7일",
            List.of("요"),
            3,
            LocalDate.of(2026, 6, 9)
        );

        when(userService.getOrCreate(USER_ID, EMAIL)).thenReturn(createUser());
        when(readingPlanRepository.existsByUserIdAndStatus(USER_ID, ReadingPlanStatus.IN_PROGRESS)).thenReturn(true);

        assertThatThrownBy(() -> readingPlanService.createReadingPlan(USER_ID, EMAIL, request))
            .isInstanceOf(DataIntegrityViolationException.class)
            .hasMessage("Reading plan already exists");

        verifyNoInteractions(bookRepository);
        verify(readingPlanRepository, never()).save(any(ReadingPlan.class));
        verify(readingPlanItemRepository, never()).saveAll(anyList());
    }

    @Test
    void createReadingPlanThrowsNotFoundWhenBookCodeDoesNotExist() {
        CreateReadingPlanRequest request = new CreateReadingPlanRequest(
            "없는 책",
            List.of("없는책"),
            3,
            LocalDate.of(2026, 6, 9)
        );

        when(userService.getOrCreate(USER_ID, EMAIL)).thenReturn(createUser());
        when(readingPlanRepository.existsByUserIdAndStatus(USER_ID, ReadingPlanStatus.IN_PROGRESS)).thenReturn(false);
        when(bookRepository.findByBookCodeInOrderByBookOrderAsc(List.of("없는책"))).thenReturn(List.of());

        assertThatThrownBy(() -> readingPlanService.createReadingPlan(USER_ID, EMAIL, request))
            .isInstanceOf(NotFoundException.class)
            .hasMessage("Bible book not found");

        verify(readingPlanRepository, never()).save(any(ReadingPlan.class));
        verify(readingPlanItemRepository, never()).saveAll(anyList());
    }

    @Test
    void getMyReadingPlanReturnsPlanWithItems() {
        User user = createUser();
        ReadingPlan plan = createPlan(10L, user, "요한복음 7일", LocalDate.of(2026, 6, 9), 3);
        List<ReadingPlanItem> items = List.of(
            createItem(plan, "요", 1, 1, 1),
            createItem(plan, "요", 2, 2, 1)
        );

        when(readingPlanRepository.findByUserIdAndStatus(USER_ID, ReadingPlanStatus.IN_PROGRESS))
            .thenReturn(Optional.of(plan));
        when(readingPlanItemRepository.findByPlanIdOrderByItemOrderAsc(10L)).thenReturn(items);
        when(readingProgressRepository.findByReadingPlanIdAndUserId(10L, USER_ID)).thenReturn(List.of(
            ReadingProgress.builder()
                .readingPlan(plan)
                .user(user)
                .bookCode("요")
                .chapterNum(1)
                .build()
        ));

        ReadingPlanResponse response = readingPlanService.getMyReadingPlan(USER_ID);

        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.items()).hasSize(2);
        assertThat(response.items().get(0).bookCode()).isEqualTo("요");
        assertThat(response.items().get(0).chapterNum()).isEqualTo(1);
        assertThat(response.completedChapters()).hasSize(1);
        assertThat(response.completedChapters().get(0).bookCode()).isEqualTo("요");
        assertThat(response.completedChapters().get(0).chapterNum()).isEqualTo(1);
    }

    @Test
    void deleteReadingPlanDeletesOnlyOwnedPlan() {
        User user = createUser();
        ReadingPlan plan = createPlan(10L, user, "요한복음 7일", LocalDate.of(2026, 6, 9), 3);

        when(readingPlanRepository.findById(10L)).thenReturn(Optional.of(plan));

        readingPlanService.deleteReadingPlan(USER_ID, 10L);

        verify(readingPlanRepository).delete(plan);
    }

    @Test
    void completeChapterSavesProgress() {
        User user = createUser();
        ReadingPlan plan = createPlan(10L, user, "요한복음 7일", LocalDate.of(2026, 6, 9), 3);
        CompleteReadingChapterRequest request = new CompleteReadingChapterRequest("요", 1);

        when(readingPlanRepository.findById(10L)).thenReturn(Optional.of(plan));
        when(readingPlanItemRepository.existsByPlanIdAndBookCodeAndChapterNum(10L, "요", 1)).thenReturn(true);
        when(readingProgressRepository.existsByReadingPlanIdAndUserIdAndBookCodeAndChapterNum(10L, USER_ID, "요", 1))
            .thenReturn(false);
        when(readingProgressRepository.save(any(ReadingProgress.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        CompleteReadingChapterResponse response = readingPlanService.completeChapter(USER_ID, 10L, request);

        assertThat(response.planId()).isEqualTo(10L);
        assertThat(response.bookCode()).isEqualTo("요");
        assertThat(response.chapterNum()).isEqualTo(1);
        assertThat(response.completedAt()).isNotNull();

        ArgumentCaptor<ReadingProgress> progressCaptor = ArgumentCaptor.forClass(ReadingProgress.class);
        verify(readingProgressRepository).save(progressCaptor.capture());
        ReadingProgress savedProgress = progressCaptor.getValue();

        assertThat(savedProgress.getReadingPlan()).isEqualTo(plan);
        assertThat(savedProgress.getUser()).isEqualTo(user);
        assertThat(savedProgress.getBookCode()).isEqualTo("요");
        assertThat(savedProgress.getChapterNum()).isEqualTo(1);
    }

    @Test
    void completeChapterThrowsConflictWhenAlreadyCompleted() {
        User user = createUser();
        ReadingPlan plan = createPlan(10L, user, "요한복음 7일", LocalDate.of(2026, 6, 9), 3);
        CompleteReadingChapterRequest request = new CompleteReadingChapterRequest("요", 1);

        when(readingPlanRepository.findById(10L)).thenReturn(Optional.of(plan));
        when(readingPlanItemRepository.existsByPlanIdAndBookCodeAndChapterNum(10L, "요", 1)).thenReturn(true);
        when(readingProgressRepository.existsByReadingPlanIdAndUserIdAndBookCodeAndChapterNum(10L, USER_ID, "요", 1))
            .thenReturn(true);

        assertThatThrownBy(() -> readingPlanService.completeChapter(USER_ID, 10L, request))
            .isInstanceOf(DataIntegrityViolationException.class)
            .hasMessage("Reading progress already exists");

        verify(readingProgressRepository, never()).save(any(ReadingProgress.class));
    }

    @Test
    void completeChapterCompletesPlanWhenLastChapterIsCompleted() {
        User user = createUser();
        ReadingPlan plan = createPlan(10L, user, "요한복음 1장", LocalDate.of(2026, 6, 9), 1);
        CompleteReadingChapterRequest request = new CompleteReadingChapterRequest("요", 1);

        when(readingPlanRepository.findById(10L)).thenReturn(Optional.of(plan));
        when(readingPlanItemRepository.existsByPlanIdAndBookCodeAndChapterNum(10L, "요", 1)).thenReturn(true);
        when(readingProgressRepository.existsByReadingPlanIdAndUserIdAndBookCodeAndChapterNum(10L, USER_ID, "요", 1))
            .thenReturn(false);
        when(readingProgressRepository.save(any(ReadingProgress.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
        when(readingPlanItemRepository.countByPlanId(10L)).thenReturn(1L);
        when(readingProgressRepository.countByReadingPlanIdAndUserId(10L, USER_ID)).thenReturn(1L);

        readingPlanService.completeChapter(USER_ID, 10L, request);

        assertThat(plan.getStatus()).isEqualTo(ReadingPlanStatus.COMPLETED);
    }

    private User createUser() {
        return User.builder()
            .id(USER_ID)
            .email(EMAIL)
            .nickname("reader")
            .build();
    }

    private BibleBook createBook(String bookCode, String nameKorean, int bookOrder, int chapterCount) {
        return BibleBook.builder()
            .bookCode(bookCode)
            .nameKorean(nameKorean)
            .testament(Testament.NEW)
            .bookOrder(bookOrder)
            .chapterCount(chapterCount)
            .build();
    }

    private ReadingPlan createPlan(
        Long id,
        User user,
        String title,
        LocalDate startDate,
        Integer dailyChapterTarget
    ) {
        return ReadingPlan.builder()
            .id(id)
            .user(user)
            .title(title)
            .startDate(startDate)
            .dailyChapterTarget(dailyChapterTarget)
            .build();
    }

    private ReadingPlanItem createItem(
        ReadingPlan plan,
        String bookCode,
        Integer chapterNum,
        Integer itemOrder,
        Integer dayNumber
    ) {
        return ReadingPlanItem.builder()
            .plan(plan)
            .bookCode(bookCode)
            .chapterNum(chapterNum)
            .itemOrder(itemOrder)
            .dayNumber(dayNumber)
            .build();
    }

    private List<ReadingPlanItem> toList(Iterable<ReadingPlanItem> items) {
        List<ReadingPlanItem> result = new ArrayList<>();
        items.forEach(result::add);
        return result;
    }

    @SuppressWarnings("unchecked")
    private ArgumentCaptor<Iterable<ReadingPlanItem>> iterableCaptor() {
        return ArgumentCaptor.forClass(Iterable.class);
    }
}
