'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OLD_TESTAMENT_BOOKS, NEW_TESTAMENT_BOOKS } from '@/data/bible-books';
import { BibleBook } from '@/types/bible';
import BookList from '@/components/BookList';
import DropdownHeader from '@/components/DropdownHeader';
import BreadcrumbTabs from '@/components/BreadcrumbTabs';
import TestamentToggle from '@/components/TestamentToggle';

export default function BiblePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'old' | 'new'>('old');
  const [mounted, setMounted] = useState(false);

  // 클라이언트에서만 localStorage 읽기 (Hydration 이슈 방지)
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('bb-bible-testament');
    if (saved === 'old' || saved === 'new') {
      setActiveTab(saved);
    }
  }, []);

  const currentBooks = activeTab === 'old' ? OLD_TESTAMENT_BOOKS : NEW_TESTAMENT_BOOKS;

  const handleBookSelect = (book: BibleBook) => {
    router.push(`/bible/${book.id}`);
  };

  const handleTestamentChange = (testament: 'old' | 'new') => {
    setActiveTab(testament);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bb-bible-testament', testament);
    }
  };

  const breadcrumbSteps = [
    { id: 'book', label: '책', active: true },
    { id: 'chapter', label: '장', active: false },
    { id: 'verse', label: '절', active: false },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* 고정 헤더 영역 */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#F0EEE7] px-[30px] pt-[20px] pb-1">
        {/* 헤더 */}
        <DropdownHeader
          title=""
          rightElement={
            <TestamentToggle
              value={activeTab}
              onChange={handleTestamentChange}
            />
          }
        />

        {/* 책-장-절 브레드크럼 */}
        <BreadcrumbTabs steps={breadcrumbSteps} />
      </div>

      {/* 스크롤 가능한 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto px-[30px] pb-[132px]" style={{ marginTop: '165px' }}>
        {/* 성경책 목록 */}
        <BookList
          books={currentBooks}
          onBookSelect={handleBookSelect}
          testament={activeTab}
        />
      </div>
    </div>
  );
}
