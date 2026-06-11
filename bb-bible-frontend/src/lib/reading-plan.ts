import { BIBLE_BOOKS, findBookById } from '@/data/bible-books';
import type { ReadingPlanItemResponse, ReadingPlanResponse } from '@/lib/api';
import type { BibleBook } from '@/types/bible';

export type ReadingPlanBookGroup = {
  book: BibleBook;
  items: ReadingPlanItemResponse[];
};

export type ReadingPlanDayGroup = {
  dayNumber: number;
  items: ReadingPlanItemResponse[];
  isCompleted: boolean;
  isCurrent: boolean;
};

export function createReadingChapterKey(bookCode: string, chapterNum: number) {
  return `${bookCode}:${chapterNum}`;
}

export function getCompletedChapterKeys(plan: ReadingPlanResponse) {
  return new Set(
    (plan.completedChapters ?? []).map((chapter) =>
      createReadingChapterKey(chapter.bookCode, chapter.chapterNum),
    ),
  );
}

export function isReadingItemCompleted(
  item: ReadingPlanItemResponse,
  completedKeys: Set<string>,
) {
  return completedKeys.has(createReadingChapterKey(item.bookCode, item.chapterNum));
}

export function getOrderedReadingItems(plan: ReadingPlanResponse) {
  return [...(plan.items ?? [])].sort((a, b) => a.itemOrder - b.itemOrder);
}

export function getReadingPlanStats(plan: ReadingPlanResponse) {
  const totalCount = plan.items?.length ?? 0;
  const completedCount = plan.completedChapters?.length ?? 0;
  const progressPercent =
    totalCount === 0 ? 0 : Math.min(100, Math.round((completedCount / totalCount) * 100));

  return {
    totalCount,
    completedCount,
    remainingCount: Math.max(0, totalCount - completedCount),
    progressPercent,
    isCompleted: totalCount > 0 && completedCount >= totalCount,
  };
}

export function getFirstIncompleteItem(plan: ReadingPlanResponse) {
  const completedKeys = getCompletedChapterKeys(plan);

  return getOrderedReadingItems(plan).find((item) => !isReadingItemCompleted(item, completedKeys));
}

export function getRecommendedReadingItems(plan: ReadingPlanResponse) {
  const orderedItems = getOrderedReadingItems(plan);
  const firstIncomplete = getFirstIncompleteItem(plan);

  if (!firstIncomplete) {
    return [];
  }

  return orderedItems.filter((item) => item.dayNumber === firstIncomplete.dayNumber);
}

export function getNextReadingItem(
  plan: ReadingPlanResponse,
  item: ReadingPlanItemResponse,
) {
  const orderedItems = getOrderedReadingItems(plan);
  const currentIndex = orderedItems.findIndex((candidate) => candidate.itemOrder === item.itemOrder);

  return currentIndex >= 0 ? orderedItems[currentIndex + 1] : undefined;
}

export function findReadingItem(
  plan: ReadingPlanResponse,
  bookCode: string,
  chapterNum: number,
) {
  return plan.items.find((item) => item.bookCode === bookCode && item.chapterNum === chapterNum);
}

export function getReadingPlanDayGroups(plan: ReadingPlanResponse) {
  const completedKeys = getCompletedChapterKeys(plan);
  const firstIncomplete = getFirstIncompleteItem(plan);
  const groups = new Map<number, ReadingPlanItemResponse[]>();

  getOrderedReadingItems(plan).forEach((item) => {
    const items = groups.get(item.dayNumber) ?? [];
    items.push(item);
    groups.set(item.dayNumber, items);
  });

  return Array.from(groups.entries()).map<ReadingPlanDayGroup>(([dayNumber, items]) => ({
    dayNumber,
    items,
    isCompleted: items.every((item) => isReadingItemCompleted(item, completedKeys)),
    isCurrent: firstIncomplete ? items.some((item) => item.itemOrder === firstIncomplete.itemOrder) : false,
  }));
}

export function getReadingPlanBookGroups(plan: ReadingPlanResponse) {
  const itemsByBook = new Map<string, ReadingPlanItemResponse[]>();

  getOrderedReadingItems(plan).forEach((item) => {
    const items = itemsByBook.get(item.bookCode) ?? [];
    items.push(item);
    itemsByBook.set(item.bookCode, items);
  });

  return BIBLE_BOOKS.map((book) => {
    const items = itemsByBook.get(book.id);

    return items ? { book, items } : null;
  }).filter((group): group is ReadingPlanBookGroup => Boolean(group));
}

export function formatReadingItems(items: ReadingPlanItemResponse[]) {
  if (items.length === 0) {
    return '읽을 말씀이 없어요';
  }

  const orderedItems = [...items].sort((a, b) => a.itemOrder - b.itemOrder);
  const result: string[] = [];
  let currentBookCode = orderedItems[0].bookCode;
  let startChapter = orderedItems[0].chapterNum;
  let previousChapter = orderedItems[0].chapterNum;

  const pushCurrentRange = () => {
    const bookName = findBookById(currentBookCode)?.name ?? currentBookCode;
    const chapterLabel =
      startChapter === previousChapter
        ? `${startChapter}장`
        : `${startChapter}-${previousChapter}장`;

    result.push(`${bookName} ${chapterLabel}`);
  };

  orderedItems.slice(1).forEach((item) => {
    const isContinuousSameBook =
      item.bookCode === currentBookCode && item.chapterNum === previousChapter + 1;

    if (isContinuousSameBook) {
      previousChapter = item.chapterNum;
      return;
    }

    pushCurrentRange();
    currentBookCode = item.bookCode;
    startChapter = item.chapterNum;
    previousChapter = item.chapterNum;
  });

  pushCurrentRange();

  return result.join(', ');
}

export function getSelectedChapterCount(bookCodes: string[]) {
  return bookCodes.reduce((sum, bookCode) => sum + (findBookById(bookCode)?.chapters ?? 0), 0);
}

export function getDefaultReadingPlanTitle(bookCodes: string[]) {
  if (bookCodes.length === BIBLE_BOOKS.length) {
    return '성경 전체 통독';
  }

  const oldCount = BIBLE_BOOKS.filter((book) => book.testament === 'old').length;
  const newCount = BIBLE_BOOKS.filter((book) => book.testament === 'new').length;
  const selectedBooks = bookCodes
    .map((bookCode) => findBookById(bookCode))
    .filter((book): book is BibleBook => Boolean(book));

  if (selectedBooks.length === oldCount && selectedBooks.every((book) => book.testament === 'old')) {
    return '구약 통독';
  }

  if (selectedBooks.length === newCount && selectedBooks.every((book) => book.testament === 'new')) {
    return '신약 통독';
  }

  if (selectedBooks.length === 1) {
    return `${selectedBooks[0].name} 통독`;
  }

  if (selectedBooks.length > 1) {
    const firstBook = selectedBooks[0];
    const lastBook = selectedBooks[selectedBooks.length - 1];

    if (selectedBooks.length <= 3) {
      return `${selectedBooks.map((book) => book.name).join(', ')} 통독`;
    }

    return `${firstBook.name}부터 ${lastBook.name}까지`;
  }

  return '나의 통독';
}

export function toReadingHref(item: ReadingPlanItemResponse, planId: number) {
  return `/bible/${encodeURIComponent(item.bookCode)}/${item.chapterNum}?readingPlanId=${planId}`;
}
