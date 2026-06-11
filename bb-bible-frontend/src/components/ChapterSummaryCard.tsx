'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { ResolvedTheme } from '@/types/bible';

interface ChapterSummaryCardProps {
  summary: string;
  effectiveTheme: ResolvedTheme;
}

const SUMMARY_CARD_THEME_COLORS: Record<
  ResolvedTheme,
  {
    chipBackground: string;
    chipBorder: string;
    chipText: string;
    popoverBackground: string;
    popoverBorder: string;
    title: string;
    text: string;
    close: string;
    closeHoverBackground: string;
  }
> = {
  light: {
    chipBackground: '#FFFFFF',
    chipBorder: '#DFD4C4',
    chipText: '#2A2A2A',
    popoverBackground: '#FFFFFF',
    popoverBorder: '#DFD4C4',
    title: '#343434',
    text: '#6E6A63',
    close: '#8D8881',
    closeHoverBackground: '#F0EEE7',
  },
  dark: {
    chipBackground: '#2F2F2F',
    chipBorder: '#4B4B4B',
    chipText: '#EAEAEA',
    popoverBackground: '#363636',
    popoverBorder: '#4B4B4B',
    title: '#EAEAEA',
    text: '#EAEAEA',
    close: '#B8B8B8',
    closeHoverBackground: '#444444',
  },
};

export default function ChapterSummaryCard({
  summary,
  effectiveTheme,
}: ChapterSummaryCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const colors = SUMMARY_CARD_THEME_COLORS[effectiveTheme];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex min-h-[30px] min-w-[76px] items-center justify-center rounded-[99px] border px-[20px] py-[8px] transition-opacity hover:opacity-75"
        style={{
          backgroundColor: colors.chipBackground,
          borderColor: colors.chipBorder,
          borderWidth: '1px',
          color: colors.chipText,
          fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '12px',
          fontWeight: 500,
          lineHeight: '14px',
        }}
        aria-expanded={isOpen}
      >
        AI 장 설명
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] z-40 w-[min(calc(100vw-60px),300px)] rounded-[4px] border px-[14px] py-[16px] text-left shadow-[0_10px_28px_rgba(55,48,38,0.18)]"
          style={{
            backgroundColor: colors.popoverBackground,
            borderColor: colors.popoverBorder,
            color: colors.text,
            fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          <div
            className="absolute right-[22px] top-[-7px] h-[14px] w-[14px] rotate-45 border-l border-t"
            style={{
              backgroundColor: colors.popoverBackground,
              borderColor: colors.popoverBorder,
            }}
          />
          <div className="mb-[12px] flex items-center justify-between gap-3">
            <p
              style={{
                color: colors.title,
                fontSize: '13px',
                fontWeight: 700,
                lineHeight: '18px',
              }}
            >
              AI 장 설명
            </p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-[28px] w-[28px] items-center justify-center rounded-[4px] transition-colors"
              style={{ color: colors.close }}
              onMouseEnter={(event) => {
                event.currentTarget.style.backgroundColor = colors.closeHoverBackground;
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label="AI 장 설명 닫기"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
          <p
            style={{
              color: colors.text,
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '24px',
            }}
          >
            {summary || '요약을 불러오는 중입니다.'}
          </p>
        </div>
      )}
    </div>
  );
}
