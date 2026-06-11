'use client';

import SearchResultItem from '@/components/search/SearchResultItem';
import type { SearchVerseItem } from '@/types/search';

interface SearchResultListProps {
  items: SearchVerseItem[];
  total: number;
  query: string;
  onItemClick: (item: SearchVerseItem) => void;
}

export default function SearchResultList({
  items,
  total,
  query,
  onItemClick,
}: SearchResultListProps) {
  return (
    <section className="px-5 py-5">
      <div className="mb-3 text-[13px] font-semibold text-[var(--icon-active)]">
        구절 검색 결과 {total.toLocaleString()}개
      </div>
      {total > items.length && (
        <p className="-mt-1 mb-3 text-[13px] font-medium text-[var(--icon-active)]">
          결과가 많아요. 단어를 더해 더 정확히 찾아보세요.
        </p>
      )}
      <div className="space-y-2">
        {items.map((item) => (
          <SearchResultItem
            key={item.verseKey}
            item={item}
            query={query}
            onClick={onItemClick}
          />
        ))}
      </div>
    </section>
  );
}
