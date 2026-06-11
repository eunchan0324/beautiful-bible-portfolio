'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { findBookById } from '@/data/bible-books';
import DropdownHeader from '@/components/DropdownHeader';
import BreadcrumbTabs from '@/components/BreadcrumbTabs';
import ChapterGrid from '@/components/ChapterGrid';
import BookSummaryPopover from '@/components/BookSummaryPopover';
import { BookSummaryResponse, fetchBookSummary } from '@/lib/api';

export default function BookChaptersPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;
  const [bookSummary, setBookSummary] = useState<BookSummaryResponse | null>(null);
  const [isBookSummaryOpen, setIsBookSummaryOpen] = useState(false);

  // 책 정보 찾기 (URL 디코딩 적용)
  const decodedBookId = decodeURIComponent(bookId);
  const book = findBookById(decodedBookId);

  useEffect(() => {
    let isMounted = true;

    setBookSummary(null);
    setIsBookSummaryOpen(false);

    if (!book) {
      return undefined;
    }

    fetchBookSummary(decodedBookId)
      .then((summary) => {
        if (isMounted) {
          setBookSummary(summary);
        }
      })
      .catch((summaryError) => {
        console.error('책 요약 로딩 오류:', summaryError);
      });

    return () => {
      isMounted = false;
    };
  }, [book, decodedBookId]);

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

  const handleChapterSelect = (chapter: number) => {
    // 절 선택 페이지로 이동
    router.push(`/bible/${bookId}/${chapter}/verses`);
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
    { id: 'chapter', label: unit, active: true },
    { id: 'verse', label: '절', active: false },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* 고정 헤더 영역 */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#F0EEE7] px-[30px] pt-[20px] pb-4">
        {/* 헤더 */}
        <DropdownHeader
          title=""
        />

        {/* 책-장-절 탭 */}
        <BreadcrumbTabs steps={breadcrumbSteps} />

        {/* 현재 선택 상태 */}
        <div className="relative">
          <h2
            className="font-semibold"
            style={{
              color: '#8D8881',
              fontSize: '14px',
              fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif'
            }}
          >
            {book.name} <span> - 총 {book.chapters}{unit}</span>
          </h2>
          {bookSummary?.shortSummary && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <BookSummaryPopover
                bookCode={decodedBookId}
                bookName={book.name}
                summary={bookSummary.shortSummary}
                isOpen={isBookSummaryOpen}
                onToggle={() => setIsBookSummaryOpen((current) => !current)}
                onClose={() => setIsBookSummaryOpen(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* 스크롤 가능한 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto px-[30px] pb-[132px]" style={{ marginTop: '170px' }}>
        {/* 장 선택 그리드 */}
        <ChapterGrid
          totalChapters={book.chapters}
          onChapterSelect={handleChapterSelect}
        />
      </div>
    </div>
  );
}
