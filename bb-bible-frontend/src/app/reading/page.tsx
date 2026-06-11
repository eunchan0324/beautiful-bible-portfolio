'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import {
  deleteReadingPlan,
  fetchMyReadingPlan,
  type ReadingPlanResponse,
} from '@/lib/api';
import {
  createReadingChapterKey,
  formatReadingItems,
  getCompletedChapterKeys,
  getFirstIncompleteItem,
  getReadingPlanBookGroups,
  getReadingPlanDayGroups,
  getReadingPlanStats,
  getRecommendedReadingItems,
  isReadingItemCompleted,
  toReadingHref,
} from '@/lib/reading-plan';
import { getApiErrorMessage } from '@/lib/api-error';

export default function ReadingPage() {
  return (
    <Suspense fallback={<ReadingPageFallback />}>
      <ReadingPageContent />
    </Suspense>
  );
}

function ReadingPageContent() {
  const searchParams = useSearchParams();
  const shouldOpenCreatedSheet = searchParams.get('created') === '1';
  const { authMode, signInWithKakao } = useAuth();
  const [plan, setPlan] = useState<ReadingPlanResponse | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState<string | null>(null);
  const [isMissionOpen, setIsMissionOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (authMode === 'loading') {
      return;
    }

    if (authMode === 'guest') {
      setStatus('ready');
      setPlan(null);
      return;
    }

    let isMounted = true;
    setStatus('loading');

    fetchMyReadingPlan()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setPlan(response);
        setStatus('ready');
        setIsMissionOpen(Boolean(response && shouldOpenCreatedSheet));
      })
      .catch((error) => {
        console.error('통독 계획을 불러오지 못했어요.', error);
        if (isMounted) {
          setStatus('error');
          setMessage(getApiErrorMessage(error, '통독 계획을 불러오지 못했어요.'));
        }
      });

    return () => {
      isMounted = false;
    };
  }, [authMode, shouldOpenCreatedSheet]);

  const handleDelete = async () => {
    if (!plan || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setMessage(null);

    try {
      await deleteReadingPlan(plan.id);
      setPlan(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      setMessage(getApiErrorMessage(error, '통독 계획을 삭제하지 못했어요.'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F0EEE7] px-5 pb-[132px] pt-7">
      <div className="mx-auto max-w-sm">
        <ReadingTopHeader />

        {authMode === 'guest' ? (
          <GuestState onSignIn={signInWithKakao} />
        ) : status === 'loading' ? (
          <LoadingState />
        ) : plan ? (
          <ReadingPlanDetail
            plan={plan}
            isDeleting={isDeleting}
            onOpenMission={() => setIsMissionOpen(true)}
            onDelete={() => setIsDeleteDialogOpen(true)}
          />
        ) : (
          <EmptyState errorMessage={status === 'error' ? message : null} />
        )}

        {message && plan && (
          <p className="mt-4 break-keep rounded-[14px] bg-[#F7E8E2] px-4 py-3 text-[13px] font-bold leading-relaxed text-[#A35F4D]">
            {message}
          </p>
        )}
      </div>

      {plan && isMissionOpen && (
        <MissionSheet plan={plan} onClose={() => setIsMissionOpen(false)} />
      )}

      {plan && isDeleteDialogOpen && (
        <DeletePlanDialog
          isDeleting={isDeleting}
          onCancel={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </main>
  );
}

function ReadingPageFallback() {
  return (
    <main className="min-h-screen bg-[#F0EEE7] px-5 pb-[132px] pt-7">
      <div className="mx-auto max-w-sm">
        <ReadingTopHeader />
        <LoadingState />
      </div>
    </main>
  );
}

function ReadingTopHeader() {
  return (
    <header className="relative flex h-10 items-center justify-center">
      <Link
        href="/"
        aria-label="홈으로 이동"
        className="absolute left-[-8px] flex h-10 w-10 items-center justify-center rounded-full text-[#414141] active:bg-[#E8E4DC]"
      >
        <ChevronLeft size={25} />
      </Link>
      <h1 className="text-[16px] font-bold text-[#343434]">나의 통독</h1>
    </header>
  );
}

function ReadingPlanDetail({
  plan,
  isDeleting,
  onOpenMission,
  onDelete,
}: {
  plan: ReadingPlanResponse;
  isDeleting: boolean;
  onOpenMission: () => void;
  onDelete: () => void;
}) {
  const stats = getReadingPlanStats(plan);
  const recommendedItems = getRecommendedReadingItems(plan);
  const firstIncomplete = getFirstIncompleteItem(plan);
  const completedKeys = getCompletedChapterKeys(plan);
  const firstIncompleteLabel = firstIncomplete ? formatReadingItems([firstIncomplete]) : null;

  return (
    <>
      <header className="mt-8">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="break-keep text-[30px] font-bold leading-tight tracking-[-0.02em] text-[#343434]">
              {plan.title}
            </h1>
            <p className="mt-3 text-[13px] font-bold text-[#8D8881]">
              {plan.startDate} 시작 · 하루 {plan.dailyChapterTarget}장
            </p>
          </div>
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            aria-label="통독 계획 삭제"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#8D8881] active:bg-[#E8E4DC] disabled:opacity-50"
          >
            {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={19} />}
          </button>
        </div>
      </header>

      <section className="mt-7 rounded-[20px] bg-white px-5 py-5">
        <p className="text-[13px] font-bold text-[#8D8881]">진행률</p>
        <div className="mt-3 flex items-end gap-2">
          <strong className="text-[34px] font-bold text-[#8A6D4E]">{stats.progressPercent}%</strong>
          <span className="pb-2 text-[13px] font-bold text-[#8D8881]">
            {stats.completedCount}/{stats.totalCount}장
          </span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E6E1D9]">
          <div
            className="h-full rounded-full bg-[#A88A63]"
            style={{ width: `${stats.progressPercent}%` }}
          />
        </div>
      </section>

      <button
        type="button"
        onClick={onOpenMission}
        className="mt-5 w-full rounded-[20px] bg-white px-5 py-5 text-left active:scale-[0.99]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[13px] font-bold text-[#8D8881]">오늘 읽을 말씀</p>
            <p className="mt-2 break-keep text-[21px] font-bold leading-snug text-[#343434]">
              {formatReadingItems(recommendedItems)}
            </p>
          </div>
          <ChevronRight size={22} className="mt-1 shrink-0 text-[#C7B8A4]" />
        </div>
      </button>

      {firstIncomplete && (
        <Link
          href={toReadingHref(firstIncomplete, plan.id)}
          className="mt-5 flex h-14 items-center justify-center rounded-full bg-[#A88A63] px-4 text-center text-[17px] font-bold text-white shadow-[0_8px_24px_rgba(77,63,46,0.18)] active:scale-[0.98]"
        >
          이어 읽기 · {firstIncompleteLabel}
        </Link>
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-[22px] font-bold text-[#343434]">진도표</h2>
        <div className="overflow-hidden rounded-[20px] bg-white">
          {getReadingPlanDayGroups(plan).map((group) => (
            <div
              key={group.dayNumber}
              className={`flex min-h-[64px] items-center gap-3 border-b border-[#EEE9E1] px-4 py-3 last:border-b-0 ${
                group.isCurrent ? 'bg-[#F4EEE6]' : ''
              }`}
            >
              <span className={`w-12 shrink-0 text-[14px] font-bold ${group.isCurrent ? 'text-[#8A6D4E]' : 'text-[#8D8881]'}`}>
                {group.dayNumber}일차
              </span>
              <span className={`h-6 w-6 shrink-0 rounded-full border-2 ${
                group.isCompleted ? 'border-[#4CAF73] bg-[#4CAF73]' : 'border-[#DDD8D0]'
              }`}>
                {group.isCompleted && <CheckIcon />}
              </span>
              <span className={`min-w-0 flex-1 break-keep text-[15px] font-bold leading-relaxed ${
                group.isCompleted ? 'text-[#4CAF73] line-through' : 'text-[#343434]'
              }`}>
                {formatReadingItems(group.items)}
              </span>
              {group.isCurrent && (
                <span className="shrink-0 rounded-full bg-[#E8DED0] px-2 py-1 text-[12px] font-bold text-[#8A6D4E]">
                  오늘
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-[22px] font-bold text-[#343434]">성경통독표</h2>
        <p className="mt-1 mb-4 break-keep text-[13px] font-semibold leading-relaxed text-[#8D8881]">
          읽은 장을 다시 볼 수 있어요
        </p>
        <div className="space-y-6">
          {getReadingPlanBookGroups(plan).map((group, index) => (
            <div key={group.book.id}>
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EFE8DC] text-[15px] font-bold text-[#8A6D4E]">
                  {index + 1}
                </span>
                <h3 className="text-[20px] font-bold text-[#343434]">{group.book.name}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => {
                  const completed = isReadingItemCompleted(item, completedKeys);
                  const href = `/bible/${encodeURIComponent(item.bookCode)}/${item.chapterNum}`;

                  return (
                    <Link
                      key={createReadingChapterKey(item.bookCode, item.chapterNum)}
                      href={href}
                      className={`flex h-10 min-w-10 items-center justify-center rounded-[10px] px-3 text-[14px] font-bold ${
                        completed
                          ? 'border border-[#A88A63] bg-[#DCCBB5] text-[#343434]'
                          : 'bg-white text-[#8D8881]'
                      }`}
                    >
                      {item.chapterNum}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function MissionSheet({ plan, onClose }: { plan: ReadingPlanResponse; onClose: () => void }) {
  const recommendedItems = getRecommendedReadingItems(plan);
  const firstIncomplete = getFirstIncompleteItem(plan);
  const dayNumber = firstIncomplete?.dayNumber ?? recommendedItems[0]?.dayNumber ?? 1;
  const firstIncompleteLabel = firstIncomplete ? formatReadingItems([firstIncomplete]) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/45 px-4 pb-4" onClick={onClose}>
      <section
        className="mx-auto w-full max-w-sm rounded-[28px] bg-white px-5 pb-5 pt-4 shadow-[0_20px_50px_rgba(0,0,0,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-6 h-1.5 w-14 rounded-full bg-[#E2DED8]" />
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[24px] font-bold text-[#343434]">오늘 읽을 말씀</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F4F1ED] text-[#6E6A63]"
          >
            ×
          </button>
        </div>

        <div className="mt-6 rounded-[18px] border border-[#E8DED0] px-4 py-7 text-center">
          <span className="rounded-[10px] bg-[#EFE8DC] px-3 py-2 text-[13px] font-bold text-[#8A6D4E]">
            DAY {dayNumber}
          </span>
          <p className="mt-5 break-keep text-[24px] font-bold leading-snug text-[#343434]">
            {formatReadingItems(recommendedItems)}
          </p>
        </div>

        {firstIncomplete && (
          <Link
            href={toReadingHref(firstIncomplete, plan.id)}
            className="mt-5 flex h-14 items-center justify-center rounded-full bg-[#A88A63] px-4 text-center text-[17px] font-bold text-white"
          >
            바로 읽기 · {firstIncompleteLabel}
          </Link>
        )}
      </section>
    </div>
  );
}

function DeletePlanDialog({
  isDeleting,
  onCancel,
  onConfirm,
}: {
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-5">
      <section className="w-full max-w-sm rounded-[24px] bg-white px-5 py-6 shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
        <h2 className="break-keep text-[22px] font-bold leading-snug text-[#343434]">
          통독 계획을 삭제할까요?
        </h2>
        <p className="mt-3 break-keep text-[14px] font-semibold leading-relaxed text-[#8D8881]">
          읽음 기록도 함께 삭제돼요.
        </p>
        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="h-[52px] rounded-[16px] bg-[#F0EEE7] text-[16px] font-bold text-[#8A6D4E] disabled:opacity-60"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex h-[52px] items-center justify-center gap-2 rounded-[16px] bg-[#A35F4D] text-[16px] font-bold text-white disabled:opacity-70"
          >
            {isDeleting && <Loader2 size={18} className="animate-spin" />}
            삭제
          </button>
        </div>
      </section>
    </div>
  );
}

function GuestState({ onSignIn }: { onSignIn: () => void }) {
  return (
    <section className="mt-8 rounded-[20px] bg-white px-5 py-6">
      <h1 className="break-keep text-[26px] font-bold leading-tight text-[#343434]">
        로그인하면 통독을 시작할 수 있어요.
      </h1>
      <p className="mt-3 break-keep text-[14px] font-semibold leading-relaxed text-[#8D8881]">
        읽음 기록과 진행률을 안전하게 저장해드릴게요.
      </p>
      <button
        type="button"
        onClick={onSignIn}
        className="mt-6 h-[52px] w-full rounded-full bg-[#343434] text-[16px] font-bold text-white"
      >
        카카오로 로그인
      </button>
    </section>
  );
}

function EmptyState({ errorMessage }: { errorMessage: string | null }) {
  return (
    <section className="mt-8 rounded-[20px] bg-white px-5 py-6">
      <h1 className="break-keep text-[26px] font-bold leading-tight text-[#343434]">
        아직 진행 중인 통독이 없어요.
      </h1>
      <p className="mt-3 break-keep text-[14px] font-semibold leading-relaxed text-[#8D8881]">
        읽을 책과 하루 목표를 정하고 나만의 통독을 시작해보세요.
      </p>
      {errorMessage && (
        <p className="mt-4 break-keep rounded-[14px] bg-[#F7E8E2] px-4 py-3 text-[13px] font-bold leading-relaxed text-[#A35F4D]">
          {errorMessage}
        </p>
      )}
      <Link
        href="/reading/new"
        className="mt-6 flex h-[52px] items-center justify-center rounded-full bg-[#A88A63] text-[16px] font-bold text-white"
      >
        통독 계획 만들기
      </Link>
    </section>
  );
}

function LoadingState() {
  return (
    <div className="mt-20 flex flex-col items-center justify-center text-[#8D8881]">
      <Loader2 size={28} className="animate-spin" />
      <p className="mt-3 text-[14px] font-bold">통독 계획을 불러오고 있어요.</p>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-full w-full p-1 text-white">
      <path
        d="M5 12.5l4.2 4.2L19 7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
    </svg>
  );
}
