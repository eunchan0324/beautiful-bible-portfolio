'use client';

import BookBadge from '@/components/commentary/BookBadge';
import { BibleBook } from '@/types/bible';

interface BookListProps {
  books: BibleBook[];
  onBookSelect: (book: BibleBook) => void;
  testament: 'old' | 'new';
}

export default function BookList({ books, onBookSelect, testament }: BookListProps) {
  return (
    <div className="grid grid-cols-2 gap-[10px]">
      {books.map((book) => (
        <button
          key={book.id}
          onClick={() => onBookSelect(book)}
          className="flex h-[50px] items-center gap-3 rounded-lg bg-white px-[10px] text-left transition-all duration-150 hover:bg-gray-50 active:scale-[0.97] active:bg-[#E8E4DC]"
          style={{
            fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif'
          }}
        >
          <BookBadge code={book.id} testament={testament} size="sm" />
          
          {/* 책 이름 */}
          <span 
            className="min-w-0 truncate font-semibold"
            style={{
              fontSize: '14px',
              color: '#414141'
            }}
          >
            {book.name}
          </span>
        </button>
      ))}
    </div>
  );
}
