'use client';

import { AlertCircle, BookOpenText, ChevronLeft, ChevronRight, Sparkle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import SlowRequestNotice from '@/components/SlowRequestNotice';
import { findBookById } from '@/data/bible-books';
import { useSlowRequest } from '@/hooks/use-slow-request';
import { BookSummaryResponse, fetchBookSummary } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import BookBadge from './BookBadge';

interface BookCommentaryDetailProps {
  bookCode: string;
}

export default function BookCommentaryDetail({ bookCode }: BookCommentaryDetailProps) {
  const router = useRouter();
  const decodedBookCode = useMemo(() => decodeURIComponent(bookCode), [bookCode]);
  const book = findBookById(decodedBookCode);
  const [summary, setSummary] = useState<BookSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isSlowLoading = useSlowRequest(isLoading);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setErrorMessage(null);
    setSummary(null);

    fetchBookSummary(decodedBookCode)
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setSummary(response);
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        setErrorMessage(getApiErrorMessage(error, '책 해설을 불러오지 못했어요.'));
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [decodedBookCode]);

  const bookName = book?.name ?? decodedBookCode;

  return (
    <main className="min-h-screen bg-[#F0EEE7] pb-[132px]">
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-[#D8D1C3] bg-[#F0EEE7] px-4 py-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#6F675D] active:bg-[#E8E4DC]"
          aria-label="뒤로 가기"
        >
          <ChevronLeft size={22} />
        </button>
        <span className="text-[14px] font-bold text-[#8D8881]">책 해설</span>
      </header>

      <div className="px-5 py-6">
        <div className="mb-4 flex items-center gap-3">
          <BookBadge code={decodedBookCode} testament={book?.testament} />
          <span className="text-[13px] font-semibold text-[#8D8881]">
            {book?.testament === 'new' ? '신약' : '구약'}
            {book ? ` · ${book.chapters}장` : ''}
          </span>
        </div>

        <h1 className="text-[30px] font-bold leading-tight text-[#343434]">
          {bookName}
        </h1>

        {isLoading && <DetailSkeleton />}
        {isSlowLoading && <SlowRequestNotice className="mt-6" />}

        {!isLoading && errorMessage && (
          <div className="mt-8 rounded-[16px] bg-white px-5 py-6 shadow-sm">
            <AlertCircle size={22} className="mb-3 text-[#A8754D]" />
            <p className="text-[15px] font-bold text-[#343434]">
              책 해설을 불러오지 못했어요
            </p>
            <p className="mt-2 break-keep text-[13px] font-medium leading-relaxed text-[#8D8881]">
              {errorMessage}
            </p>
          </div>
        )}

        {!isLoading && !errorMessage && !summary && (
          <div className="mt-8 rounded-[16px] bg-white px-5 py-6 shadow-sm">
            <p className="text-[15px] font-bold text-[#343434]">
              아직 준비 중인 책 해설이에요
            </p>
            <p className="mt-2 break-keep text-[13px] font-medium leading-relaxed text-[#8D8881]">
              책 요약 데이터가 준비되면 이곳에 표시됩니다.
            </p>
          </div>
        )}

        {summary && (
          <article className="mt-4">
            <p className="break-keep text-[17px] font-serif leading-[1.85] text-[#3F3A33]">
              {summary.shortSummary}
            </p>

            <section className="mt-7 space-y-4">
              {summary.summary.split(/\n+/).map((paragraph, index) => (
                <p
                  key={`${summary.bookCode}-paragraph-${index}`}
                  className="break-keep text-[16px] font-serif leading-[1.9] text-[#3F3A33]"
                >
                  {paragraph}
                </p>
              ))}
            </section>

            <section className="mt-8 rounded-[16px] bg-[#FFFBF3] px-5 py-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-[13px] font-bold text-[#7A6048]">
                <Sparkle size={16} />
                읽기 포인트
              </div>
              <p className="break-keep text-[15px] font-semibold leading-relaxed text-[#4A4640]">
                {summary.readingPoint}
              </p>
            </section>

            <section className="mt-8">
              <h2 className="mb-3 text-[15px] font-bold text-[#343434]">핵심 단어</h2>
              <div className="flex flex-wrap gap-2">
                {summary.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full bg-white px-3 py-2 text-[13px] font-semibold text-[#6F675D] shadow-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="mb-3 text-[15px] font-bold text-[#343434]">흐름 따라 읽기</h2>
              <ol className="rounded-[16px] bg-white px-5 py-5 shadow-sm">
                {summary.outline.map((item, index) => (
                  <li key={item} className="flex gap-3 pb-4 last:pb-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8DED0] text-[12px] font-bold text-[#7A6048]">
                      {index + 1}
                    </span>
                    <span className="break-keep text-[14px] font-semibold leading-relaxed text-[#4A4640]">
                      {item}
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            <button
              type="button"
              onClick={() => router.push(`/bible/${encodeURIComponent(decodedBookCode)}`)}
              className="mt-8 flex w-full items-center gap-3 rounded-[14px] border border-[#D8D1C3] bg-white px-5 py-4 text-left shadow-sm active:bg-[#F8F5EE]"
            >
              <BookOpenText size={21} className="text-[#6F675D]" />
              <span className="flex-1 text-[15px] font-bold text-[#343434]">
                성경에서 {bookName} 펼쳐 읽기
              </span>
              <ChevronRight size={18} className="text-[#A29A90]" />
            </button>
          </article>
        )}
      </div>
    </main>
  );
}

function DetailSkeleton() {
  return (
    <div className="mt-6 space-y-4">
      <div className="h-5 w-11/12 animate-pulse rounded-full bg-white" />
      <div className="h-5 w-8/12 animate-pulse rounded-full bg-white" />
      <div className="mt-7 h-28 animate-pulse rounded-[16px] bg-white" />
      <div className="h-40 animate-pulse rounded-[16px] bg-white" />
    </div>
  );
}
