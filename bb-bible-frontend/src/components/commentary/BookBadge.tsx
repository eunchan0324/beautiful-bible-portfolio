interface BookBadgeProps {
  code: string;
  testament?: 'old' | 'new';
  size?: 'sm' | 'md';
}

export default function BookBadge({
  code,
  testament = 'old',
  size = 'md',
}: BookBadgeProps) {
  const isOld = testament === 'old';
  const sizeClass = size === 'sm' ? 'h-7 w-7 text-[12px]' : 'h-9 w-9 text-[14px]';

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-[10px] font-bold ${sizeClass}`}
      style={{
        backgroundColor: isOld ? '#E8DED0' : '#DFE8E2',
        color: isOld ? '#7A6048' : '#5B7567',
      }}
    >
      {code}
    </span>
  );
}
