'use client';

import { ChevronRight } from 'lucide-react';
import type { SearchVerseItem } from '@/types/search';

interface SearchResultItemProps {
  item: SearchVerseItem;
  query: string;
  onClick: (item: SearchVerseItem) => void;
}

function highlightText(text: string, query: string) {
  const keyword = query.trim();

  if (!keyword) {
    return text;
  }

  const parts = text.split(keyword);

  if (parts.length === 1) {
    return text;
  }

  return parts.map((part, index) => (
    <span key={`${part}-${index}`}>
      {part}
      {index < parts.length - 1 && (
        <mark className="rounded-[3px] bg-[#EFE3C4] px-0.5 font-bold text-[var(--text-primary)]">
          {keyword}
        </mark>
      )}
    </span>
  ));
}

export default function SearchResultItem({ item, query, onClick }: SearchResultItemProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className="w-full rounded-xl bg-white px-4 py-4 text-left shadow-[0_1px_4px_rgba(65,65,65,0.08)] transition-transform active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[var(--book-button-circle-old)] text-[13px] text-[var(--text-primary)]">
          {item.bookCode}
        </span>
        <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-[var(--text-primary)]">
          {item.bookName}
          <span className="ml-1 text-[13px] font-medium text-[var(--breadcrumb-active)]">
            {item.chapterNum}:{item.verseNum}
          </span>
        </span>
        <ChevronRight size={17} className="shrink-0 text-[var(--icon-inactive)]" />
      </div>
      <p className="mt-3 pl-10 text-[14px] leading-[1.55] text-[var(--text-primary)] [word-break:keep-all]">
        {highlightText(item.verseText, query)}
      </p>
    </button>
  );
}
