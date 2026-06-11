'use client';

import { ReactNode } from 'react';
import { ChevronLeftIcon } from 'lucide-react';
import { ResolvedTheme } from '@/types/bible';

interface StickyHeaderProps {
  bookName: string;
  chapterNumber: number;
  chapterUnit: string;
  effectiveTheme: ResolvedTheme;
  onBookChapterSelect: () => void;
  rightContent?: ReactNode;
}

const HEADER_THEME_COLORS: Record<
  ResolvedTheme,
  {
    background: string;
    text: string;
  }
> = {
  light: {
    background: '#FCFBFB',
    text: '#414141',
  },
  dark: {
    background: '#2F2F2F',
    text: '#EAEAEA',
  },
};

export default function StickyHeader({
  bookName,
  chapterNumber,
  chapterUnit,
  effectiveTheme,
  onBookChapterSelect,
  rightContent,
}: StickyHeaderProps) {
  const colors = HEADER_THEME_COLORS[effectiveTheme];

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 flex h-[70px] items-center px-[30px]"
      style={{
        backgroundColor: colors.background,
        paddingTop: '20px',
        paddingBottom: '20px',
      }}
    >
      <button
        type="button"
        onClick={onBookChapterSelect}
        className="flex h-[30px] min-w-0 flex-1 items-center gap-2 transition-opacity hover:opacity-70"
        aria-label="성경 목록으로 이동"
      >
        <ChevronLeftIcon size={24} strokeWidth={2.2} style={{ color: colors.text }} />
        <span
          className="truncate"
          style={{
            color: colors.text,
            fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '20px',
            fontWeight: 700,
            lineHeight: '30px',
          }}
        >
          {bookName} {chapterNumber}{chapterUnit}
        </span>
      </button>
      {rightContent && <div className="ml-3 shrink-0">{rightContent}</div>}
    </header>
  );
}
