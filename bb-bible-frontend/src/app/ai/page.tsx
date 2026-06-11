'use client';

import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';

const TEASER_BOOKS = [
  { code: '창', name: '창세기' },
  { code: '시', name: '시편' },
  { code: '요', name: '요한복음' },
];

const TEASER_PEOPLE = [
  { code: 'abraham', name: '아브라함', label: '믿음과 언약' },
];

export default function AiPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#F0EEE7] px-5 pb-[132px] pt-9">
      <div className="mx-auto flex max-w-[390px] flex-col">
        <PageHeader
          title="해설"
          subtitle="말씀을 더 깊이 이해하도록 돕는 해설을 모았어요"
        />

        <section className="mb-6 rounded-[16px] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <button
            type="button"
            onClick={() => router.push('/ai/books')}
            className="flex w-full items-center gap-4 text-left transition-transform active:scale-[0.99]"
          >
              {/* <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#F4EFE6] text-[#7A6048]">
                <BookOpenText size={23} strokeWidth={2.1} />
              </span> */}
              <span className="min-w-0 flex-1">
                <span className="block text-[18px] font-bold text-[#343434]">
                  성경책 해설
                </span>
                <span className="mt-1 block text-[13px] font-medium leading-relaxed text-[#7A746B]">
                  66권의 흐름과 읽기 포인트
                </span>
              </span>
              <span className="flex items-center gap-1 text-[12px] font-semibold text-[#8D8881]">
                <ChevronRight size={16} strokeWidth={2.2} />
              </span>
          </button>

          <div className="mt-5 border-t border-[#E3DED4] pt-4">
              {TEASER_BOOKS.map(({ code, name }) => (
                <button
                  type="button"
                  key={code}
                  onClick={() => router.push(`/ai/books/${encodeURIComponent(code)}`)}
                  className="mb-2 flex w-full items-center gap-3 rounded-[12px] bg-[#F8F5EE] px-3 py-2 text-left transition-colors last:mb-0 active:bg-[#EFE8DC]"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E8DED0] text-[12px] font-bold text-[#7A6048]">
                    {code}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-[#4A4640]">
                      {name}
                    </span>
                  </span>
                </button>
              ))}
          </div>
        </section>

        <section className="rounded-[16px] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <button
            type="button"
            onClick={() => router.push('/ai/persons')}
            className="flex w-full items-center gap-4 text-left transition-transform active:scale-[0.99]"
          >
            {/* <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#ECE8DE] text-[#A29A90]">
              <UserRound size={23} strokeWidth={2.1} />
            </span> */}
            <span className="min-w-0 flex-1">
              <span className="block text-[18px] font-bold text-[#343434]">
                인물 해설
              </span>
              <span className="mt-1 block text-[13px] font-medium leading-relaxed text-[#7A746B]">
                주요 인물의 이야기 흐름과 관련 구절
              </span>
            </span>
            <span className="flex items-center gap-1 text-[12px] font-semibold text-[#8D8881]">
              <ChevronRight size={16} strokeWidth={2.2} />
            </span>
          </button>

          <div className="mt-5 border-t border-[#E3DED4] pt-4">
            {TEASER_PEOPLE.map(({ code, name, label }) => (
              <button
                type="button"
                key={code}
                onClick={() => router.push(`/ai/persons/${code}`)}
                className="mb-2 flex w-full items-center gap-3 rounded-[12px] bg-[#F8F5EE] px-3 py-2 text-left transition-colors last:mb-0 active:bg-[#EFE8DC]"
              >
                <span
                  className="flex h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-[#DDD2C1] bg-cover bg-center"
                  style={{ backgroundImage: `url(/images/persons/${code}.webp)` }}
                >
                  <span className="h-full w-full bg-[linear-gradient(135deg,rgba(92,74,55,0.22),rgba(244,239,230,0.70))]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold text-[#4A4640]">
                    {name}
                  </span>
                  <span className="mt-0.5 block text-[11px] font-medium text-[#8D8881]">
                    {label}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <p className="mt-6 break-keep px-1 text-[12px] font-medium leading-relaxed text-[#8D8881]">
          앞으로 배경 해설과 주제 해설도 이곳에 함께 모을 예정이에요.
        </p>
      </div>
    </main>
  );
}
