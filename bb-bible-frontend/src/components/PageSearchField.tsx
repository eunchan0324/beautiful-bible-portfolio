'use client';

import { Search, X } from 'lucide-react';

interface PageSearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder: string;
  className?: string;
}

export default function PageSearchField({
  value,
  onChange,
  onClear,
  placeholder,
  className = '',
}: PageSearchFieldProps) {
  return (
    <label
      className={`flex h-[46px] items-center gap-3 rounded-full bg-white px-4 shadow-[0_1px_4px_rgba(65,65,65,0.12)] focus-within:shadow-[0_0_0_2px_rgba(141,136,129,0.35)] ${className}`}
    >
      <Search size={18} className="shrink-0 text-[#8D8881]" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[15px] font-medium text-[#414141] outline-none placeholder:text-[#A9A39B]"
        autoComplete="off"
        enterKeyHint="search"
        inputMode="search"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="검색어 지우기"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D4CEC3] text-white active:bg-[#BEB7AC]"
        >
          <X size={14} />
        </button>
      )}
    </label>
  );
}
