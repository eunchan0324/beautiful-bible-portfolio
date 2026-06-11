'use client';

import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MyRowProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  href?: string;
  badge?: string;
  disabled?: boolean;
  tone?: 'default' | 'danger';
  onClick?: () => void;
}

export default function MyRow({
  icon: Icon,
  title,
  description,
  href,
  badge,
  disabled = false,
  tone = 'default',
  onClick,
}: MyRowProps) {
  const router = useRouter();
  const isInteractive = Boolean(href || onClick) && !disabled;
  const titleColor = tone === 'danger' ? 'text-[#B5564A]' : 'text-[#414141]';

  const handleClick = () => {
    if (!isInteractive) {
      return;
    }

    if (onClick) {
      onClick();
      return;
    }

    if (href) {
      router.push(href);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isInteractive}
      className="flex w-full items-center gap-3 px-4 py-4 text-left disabled:cursor-default"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F0EEE7] text-[#8D8881]">
        <Icon size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-[15px] font-semibold ${titleColor}`}>{title}</span>
        {description && (
          <span className="mt-1 block truncate text-[12px] font-medium text-[#8D8881]">
            {description}
          </span>
        )}
      </span>
      {badge && (
        <span className="rounded-full bg-[#F3EBD3] px-2.5 py-1 text-[11px] font-semibold text-[#8D7B4E]">
          {badge}
        </span>
      )}
      {isInteractive && <ChevronRight size={20} className="shrink-0 text-[#C2BFB8]" />}
    </button>
  );
}
