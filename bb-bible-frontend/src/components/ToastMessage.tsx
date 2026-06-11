'use client';

import { ResolvedTheme } from '@/types/bible';

interface ToastMessageProps {
  message: string;
  effectiveTheme: ResolvedTheme;
}

export default function ToastMessage({ message, effectiveTheme }: ToastMessageProps) {
  return (
    <div className="fixed bottom-[108px] left-1/2 z-50 -translate-x-1/2 px-4">
      <div
        className="rounded-full px-4 py-2"
        style={{
          backgroundColor: effectiveTheme === 'dark' ? 'rgba(243, 239, 232, 0.96)' : 'rgba(65, 65, 65, 0.92)',
          color: effectiveTheme === 'dark' ? '#171717' : '#FFFFFF',
          fontSize: '14px',
          fontWeight: 600,
          fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
          boxShadow:
            effectiveTheme === 'dark'
              ? '0 8px 24px rgba(0, 0, 0, 0.30)'
              : '0 8px 24px rgba(65, 65, 65, 0.18)',
          whiteSpace: 'nowrap',
        }}
      >
        {message}
      </div>
    </div>
  );
}
