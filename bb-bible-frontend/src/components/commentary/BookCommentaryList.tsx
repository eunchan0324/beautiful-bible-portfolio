'use client';

import { ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import PageSearchField from '@/components/PageSearchField';
import { BIBLE_BOOKS, BOOK_MAP } from '@/data/bible-books';
import BookBadge from './BookBadge';
import { NEW_TESTAMENT_DIVISIONS, OLD_TESTAMENT_DIVISIONS } from './bookDivisions';

type TestamentTab = 'old' | 'new';

export default function BookCommentaryList() {
  const [query, setQuery] = useState('');
  const [testament, setTestament] = useState<TestamentTab>('old');

  const trimmedQuery = query.trim();
  const isSearching = trimmedQuery.length > 0;
  const divisions = testament === 'old' ? OLD_TESTAMENT_DIVISIONS : NEW_TESTAMENT_DIVISIONS;

  const searchResults = useMemo(() => {
    if (!trimmedQuery) {
      return [];
    }

    return BIBLE_BOOKS.filter(
      (book) => book.name.includes(trimmedQuery) || book.id.includes(trimmedQuery),
    );
  }, [trimmedQuery]);

  return (
    <main className="min-h-screen bg-[#F0EEE7] pb-[132px]">
      <PageHeader title="책 해설" align="center" showBack sticky>
        <PageSearchField
          value={query}
          onChange={setQuery}
          onClear={() => setQuery('')}
          placeholder="책 이름으로 찾기"
          className="mt-3"
        />

        {!isSearching && (
          <div className="mt-3 grid grid-cols-2 rounded-full bg-black/5 p-1">
            {[
              { id: 'old', label: '구약' },
              { id: 'new', label: '신약' },
            ].map((tab) => {
              const active = testament === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTestament(tab.id as TestamentTab)}
                  className={`h-9 rounded-full text-[14px] font-bold transition-colors ${
                    active ? 'bg-white text-[#343434] shadow-sm' : 'text-[#8D8881]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </PageHeader>

      <div className="px-5 pt-3">
        {isSearching ? (
          <section>
            <p className="mb-3 px-1 text-[13px] font-semibold text-[#8D8881]">
              검색 결과 {searchResults.length}권
            </p>
            {searchResults.length === 0 ? (
              <div className="rounded-[16px] bg-white px-5 py-10 text-center shadow-sm">
                <p className="text-[15px] font-bold text-[#343434]">
                  맞는 책이 없어요
                </p>
                <p className="mt-2 text-[13px] font-medium text-[#8D8881]">
                  책 이름이나 줄임말로 다시 찾아보세요.
                </p>
              </div>
            ) : (
              <div className="rounded-[16px] bg-white px-4 shadow-sm">
                {searchResults.map((book, index) => (
                  <BookRow
                    key={book.id}
                    code={book.id}
                    last={index === searchResults.length - 1}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <div className="space-y-2">
            {divisions.map((division) => (
              <section key={division.id}>
                <div className="flex items-baseline gap-2 px-1 py-3">
                  <h2 className="text-[15px] font-bold text-[#343434]">
                    {division.label}
                  </h2>
                  <span className="text-[12px] font-medium text-[#8D8881]">
                    {division.hint}
                  </span>
                  <span className="ml-auto text-[11px] font-medium text-[#B5AEA4]">
                    {division.codes.length}권
                  </span>
                </div>
                <div className="rounded-[16px] bg-white px-4 shadow-sm">
                  {division.codes.map((code, index) => (
                    <BookRow
                      key={code}
                      code={code}
                      last={index === division.codes.length - 1}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function BookRow({
  code,
  last,
}: {
  code: string;
  last: boolean;
}) {
  const router = useRouter();
  const book = BOOK_MAP[code];

  if (!book) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => router.push(`/ai/books/${encodeURIComponent(code)}`)}
      className={`flex w-full items-center gap-3 py-4 text-left active:bg-[#F8F5EE] ${
        last ? '' : 'border-b border-[#EEEAE2]'
      }`}
    >
      <BookBadge code={code} testament={book.testament} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-[15px] font-bold text-[#343434]">
            {book.name}
          </span>
          <span className="text-[12px] font-medium text-[#B5AEA4]">
            {book.chapters}장
          </span>
        </span>
      </span>
      <ChevronRight size={17} className="shrink-0 text-[#C4BDB2]" />
    </button>
  );
}
