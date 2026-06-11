'use client';

import PageHeader from '@/components/PageHeader';
import PageSearchField from '@/components/PageSearchField';

interface SearchHeaderProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export default function SearchHeader({ value, onChange, onClear }: SearchHeaderProps) {
  return (
    <PageHeader title="검색" sticky>
      <PageSearchField
        value={value}
        onChange={onChange}
        onClear={onClear}
        placeholder="말씀이나 성경책을 검색해보세요"
        className="mt-3"
      />
    </PageHeader>
  );
}
