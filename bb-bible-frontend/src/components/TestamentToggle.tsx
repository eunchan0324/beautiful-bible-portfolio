'use client';

type Testament = 'old' | 'new';

interface TestamentToggleProps {
  value: Testament;
  onChange: (value: Testament) => void;
}

const options: Array<{ value: Testament; label: string }> = [
  { value: 'old', label: '구약' },
  { value: 'new', label: '신약' },
];

export default function TestamentToggle({ value, onChange }: TestamentToggleProps) {
  return (
    <div className="grid h-9 w-[112px] grid-cols-2 rounded-[14px] bg-black/5 p-1">
      {options.map((option) => {
        const active = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`rounded-[11px] text-[12px] font-semibold transition-colors ${
              active ? 'bg-white text-[#343434] shadow-sm' : 'text-[#8D8881]'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
