'use client';

import { Copy, Share, X } from 'lucide-react';

interface HighlightActionBarProps {
  selectedCount: number;
  onCopy: () => void;
  onShare: () => void;
  onClear: () => void;
  isVisible: boolean;
}

export default function HighlightActionBar({
  selectedCount,
  onCopy,
  onShare,
  onClear,
  isVisible
}: HighlightActionBarProps) {
  return (
    <div
      className={`fixed bottom-24 left-0 right-0 z-40 transition-all duration-300 ease-in-out px-4 ${isVisible
        ? 'translate-y-0 opacity-100'
        : 'translate-y-10 opacity-0 pointer-events-none'
        }`}
    >
      <div
        className="max-w-md mx-auto rounded-2xl shadow-xl flex items-center justify-between px-5 py-3"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onClear}
            className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors"
            aria-label="Clear selection"
          >
            <X size={20} color="var(--text-secondary)" />
          </button>

          <span
            style={{
              fontFamily: 'Pretendard, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--text-primary)'
            }}
          >
            {selectedCount}개 선택됨
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-3 py-2 rounded-full transition-colors active:scale-95 hover:bg-black/5"
            style={{
              color: 'var(--text-primary)'
            }}
            aria-label="Share selection"
          >
            <Share size={18} />
          </button>

          <button
            onClick={onCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-full transition-colors active:scale-95"
            style={{
              backgroundColor: 'var(--text-primary)',
              color: 'white'
            }}
          >
            <Copy size={16} />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>복사</span>
          </button>
        </div>
      </div>
    </div>
  );
}
