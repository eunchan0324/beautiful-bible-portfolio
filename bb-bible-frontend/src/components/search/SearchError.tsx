'use client';

import { AlertCircle } from 'lucide-react';

interface SearchErrorProps {
  message?: string | null;
  onRetry: () => void;
}

export default function SearchError({ message, onRetry }: SearchErrorProps) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center px-8 text-center">
      <div className="mb-6 flex h-[84px] w-[84px] items-center justify-center rounded-full border-2 border-[var(--icon-inactive)] text-[var(--icon-active)]">
        <AlertCircle size={38} />
      </div>
      <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
        잠시 후 다시 시도해주세요
      </h2>
      <p className="mt-2 text-[13px] font-medium leading-relaxed text-[var(--icon-active)]">
        {message ?? '검색 결과를 불러오는 중 문제가 생겼어요'}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-full bg-[var(--text-primary)] px-6 py-2.5 text-[14px] font-semibold text-white"
      >
        다시 시도
      </button>
    </div>
  );
}
