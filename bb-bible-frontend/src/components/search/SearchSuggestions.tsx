'use client';

import { BookOpen } from 'lucide-react';

const KEYWORD_SUGGESTIONS = ['사랑', '기도', '위로', '믿음'];
const BOOK_GROUPS = [
  {
    title: '모세오경',
    books: ['창세기', '출애굽기', '레위기', '민수기', '신명기'],
  },
  {
    title: '복음서',
    books: ['마태복음', '마가복음', '누가복음', '요한복음'],
  },
];

interface SearchSuggestionsProps {
  onPick: (value: string) => void;
}

export default function SearchSuggestions({ onPick }: SearchSuggestionsProps) {
  return (
    <div className="space-y-7 px-5 py-6">
      <section>
        <h2 className="mb-3 text-[13px] font-semibold text-[var(--icon-active)]">
          이런 말씀은 어때요?
        </h2>
        <div className="flex flex-wrap gap-2">
          {KEYWORD_SUGGESTIONS.map((keyword) => (
            <button
              key={keyword}
              type="button"
              onClick={() => onPick(keyword)}
              className="rounded-full bg-white px-4 py-[9px] text-[14px] font-semibold text-[var(--text-primary)] shadow-[0_1px_3px_rgba(65,65,65,0.08)]"
            >
              {keyword}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[13px] font-semibold text-[var(--icon-active)]">
          책으로 바로가기
        </h2>
        <div className="space-y-4">
          {BOOK_GROUPS.map((group) => (
            <div key={group.title}>
              <div className="mb-2 text-[12px] font-semibold text-[var(--icon-active)]">
                {group.title}
              </div>
              <div className="flex flex-wrap gap-2">
                {group.books.map((bookName) => (
                  <button
                    key={bookName}
                    type="button"
                    onClick={() => onPick(bookName)}
                    className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-[9px] text-[14px] font-semibold text-[var(--text-primary)]"
                  >
                    <BookOpen size={15} className="text-[var(--icon-active)]" />
                    {bookName}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
