'use client';

import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BookSummaryPopoverProps {
  bookCode: string;
  bookName: string;
  summary: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

function hasFinalConsonant(text: string) {
  const lastChar = text.trim().at(-1);

  if (!lastChar) {
    return false;
  }

  const code = lastChar.charCodeAt(0);
  const hangulStart = '가'.charCodeAt(0);
  const hangulEnd = '힣'.charCodeAt(0);

  if (code < hangulStart || code > hangulEnd) {
    return false;
  }

  return (code - hangulStart) % 28 !== 0;
}

function getBookQuestionLabel(bookName: string) {
  return `${bookName}${hasFinalConsonant(bookName) ? '이란' : '란'}?`;
}

export default function BookSummaryPopover({
  bookCode,
  bookName,
  summary,
  isOpen,
  onToggle,
  onClose,
}: BookSummaryPopoverProps) {
  const router = useRouter();

  const handleDetailClick = () => {
    onClose();
    router.push(`/ai/books/${encodeURIComponent(bookCode)}`);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="rounded-full border border-[#D8D1C3] bg-white/70 px-3 py-1 text-[12px] font-semibold text-[#6F675D] shadow-sm transition-colors active:bg-[#E8E4DC]"
      >
        {getBookQuestionLabel(bookName)}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[min(76vw,360px)] rounded-lg border border-[#D8D1C3] bg-white px-4 py-4 text-left shadow-[0_10px_28px_rgba(55,48,38,0.18)]">
          <div className="absolute right-7 top-[-7px] h-3.5 w-3.5 rotate-45 border-l border-t border-[#D8D1C3] bg-white" />
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[13px] font-semibold text-[#3F3A33]">
              AI 책 요약
            </p>
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[#8D8881] transition-all duration-150 hover:bg-[#F0EEE7] active:scale-90 active:bg-[#E8E4DC]"
              aria-label="책 요약 닫기"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
          <p className="text-[14px] leading-[1.7] text-[#5E5850]">
            {summary}
          </p>
          <button
            type="button"
            onClick={handleDetailClick}
            className="mt-3 text-[13px] font-semibold text-[#7A4F1F]"
          >
            자세히 보기
          </button>
        </div>
      )}
    </div>
  );
}
