'use client';

import { ChevronRight } from 'lucide-react';
import type { BibleBook } from '@/types/bible';

interface BookShortcutSectionProps {
  books: BibleBook[];
  onBookClick: (book: BibleBook) => void;
}

function getTestamentLabel(testament: BibleBook['testament']) {
  return testament === 'old' ? '구약' : '신약';
}

export default function BookShortcutSection({
  books,
  onBookClick,
}: BookShortcutSectionProps) {
  if (books.length === 0) {
    return null;
  }

  return (
    <section className="px-5 pt-5">
      <h2 className="mb-2 text-[13px] font-semibold text-[var(--icon-active)]">
        책 바로가기
      </h2>
      <div className="space-y-2">
        {books.map((book) => (
          <button
            key={book.id}
            type="button"
            onClick={() => onBookClick(book)}
            className="flex w-full items-center gap-3 rounded-[14px] bg-white px-4 py-3 text-left shadow-[0_1px_4px_rgba(65,65,65,0.08)] transition-transform active:scale-[0.99]"
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold text-[var(--text-primary)]"
              style={{
                backgroundColor:
                  book.testament === 'old'
                    ? 'var(--book-button-circle-old)'
                    : 'var(--book-button-circle-new)',
              }}
            >
              {book.id}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[16px] font-semibold text-[var(--text-primary)]">
                {book.name}
              </span>
              <span className="mt-1 block text-[12px] font-medium text-[var(--icon-active)]">
                {book.chapters}장 · {getTestamentLabel(book.testament)}
              </span>
            </span>
            <span className="flex shrink-0 items-center text-[12px] font-semibold text-[var(--icon-active)]">
              책으로 이동
              <ChevronRight size={15} />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
