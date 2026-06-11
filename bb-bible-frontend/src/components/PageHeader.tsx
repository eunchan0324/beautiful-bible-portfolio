'use client';

import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  align?: 'left' | 'center';
  showBack?: boolean;
  rightAction?: ReactNode;
  sticky?: boolean;
  children?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  meta,
  align = 'left',
  showBack = false,
  rightAction,
  sticky = false,
  children,
  className = '',
}: PageHeaderProps) {
  const router = useRouter();
  const headerClassName = sticky
    ? `sticky top-0 z-30 border-b border-[#D8D1C3] bg-[#F0EEE7] px-5 pb-4 pt-9 ${className}`
    : `mb-7 ${className}`;
  const isCenter = align === 'center';

  return (
    <header className={headerClassName}>
      {isCenter ? (
        <div className="relative h-10">
          {showBack && (
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="뒤로 가기"
              className="absolute left-[-8px] top-0 flex h-10 w-10 items-center justify-center rounded-full text-[#414141] active:bg-[#E8E4DC]"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <h1 className="absolute left-1/2 top-1/2 max-w-[70%] -translate-x-1/2 -translate-y-1/2 truncate text-center text-[18px] font-semibold text-[#414141]">
            {title}
          </h1>

          {rightAction && <div className="absolute right-0 top-0">{rightAction}</div>}
        </div>
      ) : (
        <>
          {showBack && (
            <div className="mb-1 flex h-10 items-center">
              <button
                type="button"
                onClick={() => router.back()}
                aria-label="뒤로 가기"
                className="-ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#414141] active:bg-[#E8E4DC]"
              >
                <ChevronLeft size={24} />
              </button>
            </div>
          )}

          <div className="flex min-h-8 items-center gap-2">
            <div className="min-w-0 flex flex-1 items-baseline gap-2">
              <h1 className="truncate text-[22px] font-bold tracking-[-0.02em] text-[#414141]">
                {title}
              </h1>
              {meta && (
                <span className="shrink-0 text-[12px] font-semibold text-[#8D8881]">
                  {meta}
                </span>
              )}
            </div>

            {rightAction && <div className="ml-auto shrink-0">{rightAction}</div>}
          </div>
        </>
      )}

      {subtitle && (
        <p className={`mt-2 break-keep text-[14px] font-medium leading-relaxed text-[#7A746B] ${isCenter ? 'text-center' : ''}`}>
          {subtitle}
        </p>
      )}

      {children}
    </header>
  );
}
