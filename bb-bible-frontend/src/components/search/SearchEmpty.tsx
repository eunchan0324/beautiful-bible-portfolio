import { Search } from 'lucide-react';

interface SearchEmptyProps {
  query: string;
}

export default function SearchEmpty({ query }: SearchEmptyProps) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center px-8 text-center">
      <div className="mb-6 flex h-[84px] w-[84px] items-center justify-center rounded-full border-2 border-[var(--icon-inactive)] text-[var(--icon-inactive)]">
        <Search size={38} />
      </div>
      <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
        ‘{query}’에 대한 결과가 없어요
      </h2>
      <p className="mt-2 text-[13px] font-medium leading-relaxed text-[var(--icon-active)]">
        다른 검색어를 입력하거나 맞춤법을 확인해보세요
      </p>
    </div>
  );
}
