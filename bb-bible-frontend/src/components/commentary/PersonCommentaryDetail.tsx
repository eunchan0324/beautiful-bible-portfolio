'use client';

import { BookOpenText, ChevronLeft, MapPinned } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import SlowRequestNotice from '@/components/SlowRequestNotice';
import { findBookById } from '@/data/bible-books';
import { useSlowRequest } from '@/hooks/use-slow-request';
import { fetchPersonCommentary, PersonCommentaryDetailResponse } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import PersonImagePanel from './PersonImagePanel';

interface PersonCommentaryDetailProps {
  personCode: string;
}

export default function PersonCommentaryDetail({ personCode }: PersonCommentaryDetailProps) {
  const router = useRouter();
  const decodedPersonCode = useMemo(() => decodeURIComponent(personCode), [personCode]);
  const [person, setPerson] = useState<PersonCommentaryDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isSlowLoading = useSlowRequest(isLoading);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setErrorMessage(null);
    setPerson(null);

    fetchPersonCommentary(decodedPersonCode)
      .then((response) => {
        if (isMounted) {
          setPerson(response);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setErrorMessage(getApiErrorMessage(error, '인물 해설을 불러오지 못했어요.'));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [decodedPersonCode]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F0EEE7] pb-[132px]">
        <DetailHeader onBack={() => router.back()} />
        <div className="px-5 py-6">
          <DetailSkeleton />
          {isSlowLoading && <SlowRequestNotice className="mt-6" />}
        </div>
      </main>
    );
  }

  if (errorMessage || !person) {
    return (
      <main className="min-h-screen bg-[#F0EEE7] px-5 py-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-8 flex h-9 w-9 items-center justify-center rounded-full text-[#6F675D] active:bg-[#E8E4DC]"
          aria-label="뒤로 가기"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="rounded-[16px] bg-white px-5 py-8 text-center shadow-sm">
          <p className="text-[16px] font-bold text-[#343434]">
            인물 해설을 찾을 수 없어요
          </p>
          <p className="mt-2 break-keep text-[13px] font-medium leading-relaxed text-[#8D8881]">
            {errorMessage ?? '준비된 인물 목록에서 다시 선택해 주세요.'}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F0EEE7] pb-[132px]">
      <DetailHeader onBack={() => router.back()} />

      <article className="px-5 py-6">
        {isSlowLoading && <SlowRequestNotice className="mb-5" />}

        <PersonImagePanel personCode={person.personCode} name={person.name} />

        <p className="mt-6 break-keep text-[18px] font-bold leading-relaxed text-[#343434]">
          {person.shortDescription}
        </p>

        <section className="mt-5 space-y-4">
          {person.description.split(/\n+/).map((paragraph, index) => (
            <p
              key={`${person.personCode}-description-${index}`}
              className="break-keep text-[16px] font-serif leading-[1.9] text-[#3F3A33]"
            >
              {paragraph}
            </p>
          ))}
        </section>

        <section className="mt-8">
          <div className="mb-3 flex items-center gap-2 text-[15px] font-bold text-[#343434]">
            <MapPinned size={17} className="text-[#7A6048]" />
            이야기 흐름
          </div>
          <ol className="space-y-3">
            {person.storyFlow.map((step, index) => (
              <li key={step.title} className="rounded-[16px] bg-white px-5 py-5 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E8DED0] text-[12px] font-bold text-[#7A6048]">
                    {index + 1}
                  </span>
                  <h2 className="text-[16px] font-bold text-[#343434]">
                    {step.title}
                  </h2>
                </div>
                <p className="break-keep text-[14px] font-medium leading-relaxed text-[#5F574D]">
                  {step.summary}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {step.verseKeys.map((verseKey) => (
                    <VerseChip key={verseKey} verseKey={verseKey} />
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-[15px] font-bold text-[#343434]">핵심 구절 바로 이동</h2>
          <div className="flex flex-wrap gap-2">
            {person.keyVerses.map((verse) => (
              <button
                key={verse.verseKey}
                type="button"
                onClick={() => router.push(getVersePath(verse.verseKey))}
                className="rounded-full bg-white px-3 py-2 text-[13px] font-bold text-[#7A6048] shadow-sm active:bg-[#F8F5EE]"
                aria-label={`${verse.label} ${verse.verseKey} 본문으로 이동`}
              >
                {verse.verseKey}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-[15px] font-bold text-[#343434]">키워드</h2>
          <div className="flex flex-wrap gap-2">
            {person.keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full bg-[#FFFBF3] px-3 py-2 text-[13px] font-semibold text-[#7A6048] shadow-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-[15px] font-bold text-[#343434]">관련 책</h2>
          <div className="flex flex-wrap gap-2">
            {person.relatedBooks.map((bookCode) => {
              const book = findBookById(bookCode);

              return (
                <button
                  key={bookCode}
                  type="button"
                  onClick={() => router.push(`/bible/${encodeURIComponent(bookCode)}`)}
                  className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[13px] font-bold text-[#6F675D] shadow-sm active:bg-[#F8F5EE]"
                >
                  <BookOpenText size={14} />
                  {book?.name ?? bookCode}
                </button>
              );
            })}
          </div>
        </section>
      </article>
    </main>
  );
}

function DetailHeader({ onBack }: { onBack: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-[#D8D1C3] bg-[#F0EEE7] px-4 py-4">
      <button
        type="button"
        onClick={onBack}
        className="flex h-9 w-9 items-center justify-center rounded-full text-[#6F675D] active:bg-[#E8E4DC]"
        aria-label="뒤로 가기"
      >
        <ChevronLeft size={22} />
      </button>
      <span className="text-[14px] font-bold text-[#8D8881]">인물 해설</span>
    </header>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="aspect-[4/3] min-h-[220px] animate-pulse rounded-[16px] bg-[#DDD2C1]" />
      <div className="h-6 w-10/12 animate-pulse rounded-full bg-white" />
      <div className="space-y-3">
        <div className="h-4 w-full animate-pulse rounded-full bg-white" />
        <div className="h-4 w-full animate-pulse rounded-full bg-white" />
        <div className="h-4 w-8/12 animate-pulse rounded-full bg-white" />
      </div>
      <div className="h-36 animate-pulse rounded-[16px] bg-white" />
    </div>
  );
}

function getVersePath(verseKey: string): string {
  const match = verseKey.match(/^(.+?)(\d+):(\d+)$/);

  if (!match) {
    return '/bible';
  }

  const [, bookCode, chapter, verse] = match;

  return `/bible/${encodeURIComponent(bookCode)}/${chapter}?startVerse=${verse}`;
}

function VerseChip({ verseKey }: { verseKey: string }) {
  return (
    <span className="rounded-full bg-[#F3EFE7] px-2.5 py-1 text-[12px] font-bold text-[#7A6048]">
      {verseKey}
    </span>
  );
}
