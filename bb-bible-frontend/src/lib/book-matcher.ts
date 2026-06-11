import { BIBLE_BOOKS } from '@/data/bible-books';
import type { BibleBook } from '@/types/bible';

interface ScoredBook {
  book: BibleBook;
  score: number;
  order: number;
}

export function findBookMatches(query: string): BibleBook[] {
  const keyword = query.trim();

  if (!keyword) {
    return [];
  }

  const scoredBooks: ScoredBook[] = [];

  BIBLE_BOOKS.forEach((book, order) => {
    let score = 0;

    if (book.id === keyword) {
      score = 100;
    } else if (book.name === keyword) {
      score = 95;
    } else if (book.id.startsWith(keyword)) {
      score = 80;
    } else if (book.name.startsWith(keyword)) {
      score = 70;
    } else if (book.name.includes(keyword)) {
      score = 40;
    }

    if (score > 0) {
      scoredBooks.push({ book, score, order });
    }
  });

  return scoredBooks
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, 3)
    .map(({ book }) => book);
}
