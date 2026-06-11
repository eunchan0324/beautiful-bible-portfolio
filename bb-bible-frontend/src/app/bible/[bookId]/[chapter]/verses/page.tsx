'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { findBookById } from '@/data/bible-books';
import { useBibleStore } from '@/hooks/use-bible-store';
import { getVerseCount } from '@/lib/bible-parser';
import DropdownHeader from '@/components/DropdownHeader';
import BreadcrumbTabs from '@/components/BreadcrumbTabs';
import ChapterGrid from '@/components/ChapterGrid';

export default function ChapterVersesPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;
  const chapterNumber = parseInt(params.chapter as string);

  // 책 정보 찾기 (URL 디코딩 적용)
  const decodedBookId = decodeURIComponent(bookId);
  const book = findBookById(decodedBookId);

  const { loadBibleData, parsedData, isLoading } = useBibleStore();
  const [verseCount, setVerseCount] = useState(30);

  // 성경 데이터 로드
  useEffect(() => {
    if (!parsedData && !isLoading) {
      loadBibleData();
    }
  }, [parsedData, isLoading, loadBibleData]);

  // 실제 절 개수 계산
  useEffect(() => {
    if (parsedData && book && !isLoading) {
      const count = getVerseCount(parsedData, book.id, chapterNumber);
      if (count > 0) {
        setVerseCount(count);
      }
    }
  }, [parsedData, book, chapterNumber, isLoading]);

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            책을 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 mb-4">
            요청하신 성경책이 존재하지 않습니다.
          </p>
          <button
            onClick={() => router.push('/bible')}
            className="px-4 py-2 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition-colors"
          >
            성경 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (chapterNumber < 1 || chapterNumber > book.chapters) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            장을 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 mb-4">
            {book.name}는 {book.chapters}장까지 있습니다.
          </p>
          <button
            onClick={() => router.push(`/bible/${bookId}`)}
            className="px-4 py-2 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition-colors"
          >
            {book.name} 장 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const handleVerseSelect = (verse: number) => {
    // 구절 읽기 페이지로 이동
    router.push(`/bible/${bookId}/${chapterNumber}?startVerse=${verse}`);
  };

  const isPsalms = book.name === '시편';
  const unit = isPsalms ? '편' : '장';

  const breadcrumbSteps = [
    {
      id: 'book',
      label: '책',
      active: false,
      clickable: true,
      onClick: () => router.push('/bible')
    },
    {
      id: 'chapter',
      label: unit,
      active: false,
      clickable: true,
      onClick: () => router.push(`/bible/${bookId}`)
    },
    { id: 'verse', label: '절', active: true },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* 고정 헤더 영역 */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#F0EEE7] px-[30px] pt-[20px] pb-4">
        {/* 헤더 */}
        <DropdownHeader
          title=""
        />

        {/* 책-장-절 브레드크럼 */}
        <BreadcrumbTabs steps={breadcrumbSteps} />

        {/* 현재 선택 상태 */}
        <div>
          <h2
            className="font-semibold"
            style={{
              color: '#8D8881',
              fontSize: '14px',
              fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif'
            }}
          >
            {book.name} {chapterNumber}{unit}
          </h2>
        </div>
      </div>

      {/* 스크롤 가능한 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto px-[30px] pb-[132px]" style={{ marginTop: '170px' }}>
        {/* 절 선택 그리드 */}
        <ChapterGrid
          totalChapters={verseCount}
          onChapterSelect={handleVerseSelect}
        />
      </div>
    </div>
  );
}
