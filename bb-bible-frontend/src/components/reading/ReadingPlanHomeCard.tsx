'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpenCheck, ChevronRight, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { fetchMyReadingPlan, type ReadingPlanResponse } from '@/lib/api';
import {
  formatReadingItems,
  getFirstIncompleteItem,
  getReadingPlanStats,
  getRecommendedReadingItems,
  toReadingHref,
} from '@/lib/reading-plan';

export default function ReadingPlanHomeCard() {
  const { authMode, signInWithKakao } = useAuth();
  const [plan, setPlan] = useState<ReadingPlanResponse | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  useEffect(() => {
    if (authMode === 'loading') {
      return;
    }

    if (authMode === 'guest') {
      setPlan(null);
      setStatus('ready');
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
      })
      .catch((error) => {
        console.error('통독 계획을 불러오지 못했어요.', error);
        if (isMounted) {
          setPlan(null);
          setStatus('error');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [authMode]);

  const isLoading = authMode === 'loading' || status === 'loading';

  return (
    <section className="rounded-[20px] bg-white px-5 py-5 shadow-[0_1px_4px_rgba(65,65,65,0.08)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#EFE8DC] text-[#8A6D4E]">
            <BookOpenCheck size={18} strokeWidth={2.2} />
          </span>
          <span className="text-[13px] font-bold text-[#8D8881]">나의 통독</span>
        </span>

        {plan && (
          <Link
            href="/reading"
            className="flex h-8 items-center gap-1 rounded-full px-2 text-[12px] font-bold text-[#8A6D4E] active:bg-[#F0EEE7]"
          >
            보기
            <ChevronRight size={15} strokeWidth={2.4} />
          </Link>
        )}
      </div>

      {isLoading ? (
        <ReadingPlanPreparingState />
      ) : authMode === 'guest' ? (
        <div>
          <p className="break-keep text-[18px] font-bold leading-snug text-[#343434]">
            로그인하면 통독 계획을 저장할 수 있어요.
          </p>
          <button
            type="button"
            onClick={signInWithKakao}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#343434] text-[15px] font-bold text-white transition-transform active:scale-[0.98]"
          >
            <LogIn size={17} />
            카카오로 로그인
          </button>
        </div>
      ) : plan ? (
        <ActivePlanContent plan={plan} />
      ) : (
        <div>
          <p className="break-keep text-[18px] font-bold leading-snug text-[#343434]">
            나만의 통독 계획을 시작해보세요
          </p>
          <p className="mt-2 text-[13px] font-semibold text-[#8D8881]">
            현재는 하나의 통독 계획만 진행할 수 있어요
          </p>
          <Link
            href="/reading/new"
            className="mt-5 flex h-12 items-center justify-center rounded-full bg-[#A88A63] text-[15px] font-bold text-white transition-transform active:scale-[0.98]"
          >
            통독 계획 만들기
          </Link>
          {status === 'error' && (
            <p className="mt-3 text-[12px] font-semibold text-[#A35F4D]">
              서버가 준비 중이면 잠시 후 다시 시도해 주세요.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function ActivePlanContent({ plan }: { plan: ReadingPlanResponse }) {
  const stats = getReadingPlanStats(plan);
  const firstIncomplete = getFirstIncompleteItem(plan);
  const recommendedItems = getRecommendedReadingItems(plan);
  const href = firstIncomplete ? toReadingHref(firstIncomplete, plan.id) : '/reading';
  const firstIncompleteLabel = firstIncomplete ? formatReadingItems([firstIncomplete]) : null;

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[18px] font-bold text-[#343434]">{plan.title}</p>
          <p className="mt-1 text-[13px] font-semibold text-[#8D8881]">
            {stats.progressPercent}% · {stats.completedCount}/{stats.totalCount}장
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[#F0EEE7] px-3 py-1 text-[12px] font-bold text-[#8A6D4E]">
          진행 중
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E6E1D9]">
        <div
          className="h-full rounded-full bg-[#A88A63]"
          style={{ width: `${stats.progressPercent}%` }}
        />
      </div>

      <div className="mt-4 rounded-[14px] bg-[#F8F6F1] px-4 py-3">
        <p className="text-[12px] font-bold text-[#8D8881]">오늘 읽을 말씀</p>
        <p className="mt-1 break-keep text-[15px] font-bold leading-relaxed text-[#343434]">
          {formatReadingItems(recommendedItems)}
        </p>
      </div>

      <Link
        href={href}
        className="mt-5 flex h-12 items-center justify-center rounded-full bg-[#343434] px-4 text-center text-[15px] font-bold text-white transition-transform active:scale-[0.98]"
      >
        {firstIncompleteLabel ? `이어 읽기 · ${firstIncompleteLabel}` : '이어 읽기'}
      </Link>
    </div>
  );
}

function ReadingPlanPreparingState() {
  return (
    <div>
      <p className="break-keep text-[18px] font-bold leading-snug text-[#343434]">
        나의 통독을 준비하고 있어요
      </p>
      <p className="mt-2 break-keep text-[13px] font-semibold leading-relaxed text-[#8D8881]">
        서버가 준비되면 통독 계획을 보여드릴게요
      </p>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#E6E1D9]">
        <div className="reading-plan-loading-progress h-full w-1/3 rounded-full bg-[#A88A63]" />
      </div>

      <div className="mt-5 flex h-12 items-center justify-center rounded-full bg-[#F0EEE7] text-[15px] font-bold text-[#8A6D4E]">
        잠시만 기다려주세요
      </div>

      <style jsx global>{`
        @keyframes reading-plan-loading-progress {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(320%);
          }
        }

        .reading-plan-loading-progress {
          animation: reading-plan-loading-progress 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
