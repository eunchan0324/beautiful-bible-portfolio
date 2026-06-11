'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import BookShortcutSection from '@/components/search/BookShortcutSection';
import SearchEmpty from '@/components/search/SearchEmpty';
import SearchError from '@/components/search/SearchError';
import SearchHeader from '@/components/search/SearchHeader';
import SearchLoadingSkeleton from '@/components/search/SearchLoadingSkeleton';
import SearchResultList from '@/components/search/SearchResultList';
import SearchSuggestions from '@/components/search/SearchSuggestions';
import SlowRequestNotice from '@/components/SlowRequestNotice';
import { useBibleSearch } from '@/hooks/use-bible-search';
import { useSlowRequest } from '@/hooks/use-slow-request';
import { findBookMatches } from '@/lib/book-matcher';
import type { BibleBook } from '@/types/bible';
import type { SearchVerseItem } from '@/types/search';

export default function SearchClientPage() {
  const router = useRouter();
  const search = useBibleSearch();
  const isSlowSearch = useSlowRequest(search.status === 'loading');
  const bookMatches = useMemo(() => findBookMatches(search.query), [search.query]);
  const hasBookMatches = bookMatches.length > 0;

  const goToBook = (book: BibleBook) => {
    router.push(`/bible/${encodeURIComponent(book.id)}`);
  };

  const goToVerse = (item: SearchVerseItem) => {
    router.push(
      `/bible/${encodeURIComponent(item.bookCode)}/${item.chapterNum}?startVerse=${item.verseNum}`,
    );
  };

  return (
    <div className="min-h-screen bg-[#F0EEE7] pb-28">
      <SearchHeader
        value={search.query}
        onChange={search.setQuery}
        onClear={() => search.setQuery('')}
      />

      {search.status === 'initial' && <SearchSuggestions onPick={search.setQuery} />}

      {search.status === 'typing' && (
        <>
          {hasBookMatches && (
            <BookShortcutSection books={bookMatches} onBookClick={goToBook} />
          )}
          <div className="px-5 py-10 text-center text-[14px] font-medium text-[var(--icon-active)]">
            본문 검색은 두 글자 이상 입력해주세요
          </div>
        </>
      )}

      {search.status === 'loading' && <SearchLoadingSkeleton />}
      {isSlowSearch && <SlowRequestNotice className="mx-5" />}

      {(search.status === 'results' || search.status === 'empty') && hasBookMatches && (
        <BookShortcutSection books={bookMatches} onBookClick={goToBook} />
      )}

      {search.status === 'results' && (
        <SearchResultList
          items={search.items}
          total={search.total}
          query={search.debouncedQuery}
          onItemClick={goToVerse}
        />
      )}

      {search.status === 'empty' && hasBookMatches && (
        <div className="px-5 py-6 text-center text-[13px] font-medium leading-relaxed text-[var(--icon-active)]">
          ‘<span className="font-semibold text-[var(--text-primary)]">{search.debouncedQuery}</span>’이(가)
          포함된 구절은 없어요
        </div>
      )}

      {search.status === 'empty' && !hasBookMatches && (
        <SearchEmpty query={search.debouncedQuery} />
      )}

      {search.status === 'error' && (
        <SearchError message={search.errorMessage} onRetry={search.retry} />
      )}
    </div>
  );
}
