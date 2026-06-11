'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bell, BellRing, BookOpenText, ChevronRight } from 'lucide-react';
import ChurchCalendarSection from '@/components/church/ChurchCalendarSection';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import ReadingPlanHomeCard from '@/components/reading/ReadingPlanHomeCard';
import { BackendWarmupStatus, useBackendWarmup } from '@/hooks/use-backend-warmup';
import { useTodayVerseNotification } from '@/hooks/use-today-verse-notification';
import { fetchTodayVerse, type TodayVerseResponse } from '@/lib/api';
import BBLogo from '../../public/icons/BB-icon-72.png';

export default function Home() {
  const backendWarmup = useBackendWarmup();
  const todayVerseNotification = useTodayVerseNotification();
  const [todayVerse, setTodayVerse] = useState<TodayVerseResponse | null>(null);
  const [todayVerseStatus, setTodayVerseStatus] = useState<TodayVerseStatus>('loading');
  const [isNotificationSheetOpen, setIsNotificationSheetOpen] = useState(false);
  const todayVerseHref = todayVerse ? getTodayVerseHref(todayVerse) : '/bible';

  const handleConfirmNotification = async () => {
    await todayVerseNotification.toggle();
    setIsNotificationSheetOpen(false);
  };

  useEffect(() => {
    let isMounted = true;

    setTodayVerseStatus('loading');
    setTodayVerse(null);

    fetchTodayVerse()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setTodayVerse(response);
        setTodayVerseStatus('ready');
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setTodayVerse(null);
        setTodayVerseStatus('error');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#F0EEE7] px-5 pb-[132px] pt-9">
      <BackendWarmupCard
        status={backendWarmup.status}
        isVisible={backendWarmup.isVisible}
      />

      <div className="mx-auto flex max-w-sm flex-col gap-6">
        <header>
          <p className="text-[13px] font-semibold text-[#8D8881]">Beautiful Bible</p>
          <h1 className="mt-1 text-[24px] font-bold tracking-[-0.02em] text-[#343434]">
            아름다운 우리교회
          </h1>
        </header>

        <section className="rounded-[20px] bg-white px-5 py-5 shadow-[0_1px_4px_rgba(65,65,65,0.08)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#E8DED0] text-[#7A6048]">
                <BookOpenText size={18} strokeWidth={2.2} />
              </span>
              <span className="text-[13px] font-bold text-[#8D8881]">오늘의 말씀</span>
            </span>
            <button
              type="button"
              onClick={() => setIsNotificationSheetOpen(true)}
              disabled={
                todayVerseNotification.permission === 'unsupported' ||
                todayVerseNotification.status === 'saving'
              }
              aria-label="오늘의 말씀 알림 설정"
              className="relative flex h-9 w-9 shrink-0 items-center justify-center text-[#8D8881] transition active:scale-95 disabled:opacity-50"
            >
              {todayVerseNotification.isEnabled ? (
                <BellRing
                  size={17}
                  strokeWidth={2.2}
                  className="fill-[#E8DED0] text-[#7A6048]"
                />
              ) : (
                <Bell size={17} strokeWidth={2.2} />
              )}
            </button>
          </div>

          <p className="break-keep text-[20px] font-bold leading-relaxed text-[#343434]">
            {todayVerse ? todayVerse.verseText : TODAY_VERSE_STATUS_CONTENT[todayVerseStatus].title}
          </p>
          <p className="mt-3 text-[13px] font-semibold text-[#8D8881]">
            {todayVerse
              ? formatTodayVerseReference(todayVerse)
              : TODAY_VERSE_STATUS_CONTENT[todayVerseStatus].description}
          </p>

          <Link
            href={todayVerseHref}
            className="mt-5 flex h-12 items-center justify-between rounded-full bg-[#343434] px-4 text-white shadow-[0_8px_22px_rgba(65,65,65,0.18)] transition-transform active:scale-[0.98]"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-[8px]">
                <Image src={BBLogo} alt="" width={32} height={32} />
              </span>
              <span className="text-[15px] font-bold tracking-[-0.02em]">성경 읽기</span>
            </span>
            <ChevronRight size={20} strokeWidth={2.2} className="text-white/80" />
          </Link>
        </section>

        <ReadingPlanHomeCard />

        <ChurchCalendarSection />
      </div>

      {isNotificationSheetOpen && (
        <TodayVerseNotificationSheet
          isEnabled={todayVerseNotification.isEnabled}
          isSaving={todayVerseNotification.status === 'saving'}
          onClose={() => setIsNotificationSheetOpen(false)}
          onConfirm={handleConfirmNotification}
        />
      )}

      <PWAInstallPrompt />
    </main>
  );
}

type TodayVerseStatus = 'loading' | 'ready' | 'error';

const TODAY_VERSE_STATUS_CONTENT: Record<
  TodayVerseStatus,
  {
    title: string;
    description: string;
  }
> = {
  loading: {
    title: '오늘의 말씀을 준비하고 있어요',
    description: '서버가 준비되면 곧 보여드릴게요.',
  },
  ready: {
    title: '',
    description: '',
  },
  error: {
    title: '오늘의 말씀을 아직 불러오지 못했어요',
    description: '첫 접속에는 1~3분 정도 걸릴 수 있어요.',
  },
};

function getTodayVerseHref(verse: TodayVerseResponse) {
  return `/bible/${encodeURIComponent(verse.bookCode)}/${verse.chapterNum}?startVerse=${verse.verseNum}`;
}

function formatTodayVerseReference(verse: TodayVerseResponse) {
  return `${verse.bookCode} ${verse.chapterNum}:${verse.verseNum}`;
}

function TodayVerseNotificationSheet({
  isEnabled,
  isSaving,
  onClose,
  onConfirm,
}: {
  isEnabled: boolean;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/45 px-4 pb-4" onClick={onClose}>
      <section
        className="mx-auto w-full max-w-sm rounded-[28px] bg-white px-5 pb-5 pt-4 shadow-[0_20px_50px_rgba(0,0,0,0.24)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-7 h-1.5 w-14 rounded-full bg-[#E2DED8]" />
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EFE8DC] text-[#8A6D4E]">
          {isEnabled ? <BellRing size={24} strokeWidth={2.3} /> : <Bell size={24} strokeWidth={2.3} />}
        </div>
        <h2 className="mt-5 break-keep text-center text-[24px] font-bold leading-snug text-[#343434]">
          {isEnabled ? '오늘의 말씀 알림을 끌까요?' : '오늘의 말씀 알림을 받을까요?'}
        </h2>
        <p className="mt-3 break-keep text-center text-[15px] font-semibold leading-relaxed text-[#8D8881]">
          {isEnabled
            ? '더 이상 오전 7~8시 사이에 오늘의 말씀 알림을 보내지 않아요'
            : '오전 7~8시 사이에 오늘의 말씀을 보내드려요'}
        </p>
        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="h-[52px] rounded-[16px] bg-[#F0EEE7] text-[16px] font-bold text-[#8A6D4E] disabled:opacity-60"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSaving}
            className="h-[52px] rounded-[16px] bg-[#343434] text-[16px] font-bold text-white disabled:opacity-70"
          >
            {isSaving ? '저장 중...' : isEnabled ? '알림 끄기' : '알림 받기'}
          </button>
        </div>
      </section>
    </div>
  );
}

function BackendWarmupCard({
  status,
  isVisible,
}: {
  status: BackendWarmupStatus;
  isVisible: boolean;
}) {
  if (!isVisible) {
    return null;
  }

  const content = BACKEND_WARMUP_CONTENT[status];

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[max(24px,env(safe-area-inset-top))] z-40 px-5">
      <section className="mx-auto max-w-[360px] rounded-[18px] border border-white/28 bg-[#F9F5EA]/92 px-4 py-3 text-[#2F2F2B] shadow-[0_16px_42px_rgba(0,0,0,0.22)] backdrop-blur-md">
        <div className="flex items-start gap-3">
          <span
            className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${content.dotClass}`}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold leading-tight text-[#34342F]">
              {content.title}
            </p>
            <p className="mt-1 break-keep text-[12px] font-semibold leading-[1.55] text-[#5F5B52]">
              {content.description}
            </p>
            {content.showProgress && (
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#DED6C6]">
                <div className="backend-warmup-progress h-full w-1/3 rounded-full bg-[#B69A60]" />
              </div>
            )}
          </div>
        </div>
      </section>
      <style jsx global>{`
        @keyframes backend-warmup-progress {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(320%);
          }
        }

        .backend-warmup-progress {
          animation: backend-warmup-progress 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

const BACKEND_WARMUP_CONTENT: Record<
  BackendWarmupStatus,
  {
    title: string;
    description: string;
    dotClass: string;
    showProgress: boolean;
  }
> = {
  preparing: {
    title: '처음 접속이라 준비 시간이 필요해요',
    description: '성경 읽기는 바로 볼 수 있고, 그 외 기능은 보통 1~3분 뒤 이용할 수 있어요.',
    dotClass: 'bg-[#B69A60]',
    showProgress: true,
  },
  slow: {
    title: '아직 준비 중이에요',
    description: '서버가 켜지는 중이라 1~3분 정도 걸릴 수 있어요. 성경 읽기는 계속 이용할 수 있어요.',
    dotClass: 'bg-[#B69A60]',
    showProgress: true,
  },
  ready: {
    title: '준비가 끝났어요',
    description: '이제 저장, 검색, 해설 기능을 이용할 수 있어요.',
    dotClass: 'bg-[#7A9A6A]',
    showProgress: false,
  },
  unavailable: {
    title: '준비가 늦어지고 있어요',
    description: '성경 읽기는 계속 이용할 수 있어요.',
    dotClass: 'bg-[#B47B5A]',
    showProgress: false,
  },
};
