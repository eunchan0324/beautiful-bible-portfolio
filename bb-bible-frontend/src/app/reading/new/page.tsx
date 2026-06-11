'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { BIBLE_BOOKS, NEW_TESTAMENT_BOOKS, OLD_TESTAMENT_BOOKS } from '@/data/bible-books';
import { useAuth } from '@/hooks/use-auth';
import { createReadingPlan } from '@/lib/api';
import {
  getDefaultReadingPlanTitle,
  getSelectedChapterCount,
} from '@/lib/reading-plan';
import { getApiErrorMessage, isApiError } from '@/lib/api-error';
import type { BibleBook } from '@/types/bible';

const BOOK_GROUPS = [
  {
    testament: '구약',
    sections: [
      { title: '모세오경', codes: ['창', '출', '레', '민', '신'] },
      { title: '역사서', codes: ['수', '삿', '룻', '삼상', '삼하', '왕상', '왕하', '대상', '대하', '스', '느', '에'] },
      { title: '시가서', codes: ['욥', '시', '잠', '전', '아'] },
      { title: '대선지서', codes: ['사', '렘', '애', '겔', '단'] },
      { title: '소선지서', codes: ['호', '욜', '암', '옵', '욘', '미', '나', '합', '습', '학', '슥', '말'] },
    ],
  },
  {
    testament: '신약',
    sections: [
      { title: '복음서', codes: ['마', '막', '눅', '요'] },
      { title: '역사서', codes: ['행'] },
      { title: '바울서신', codes: ['롬', '고전', '고후', '갈', '엡', '빌', '골', '살전', '살후', '딤전', '딤후', '딛', '몬'] },
      { title: '공동서신', codes: ['히', '약', '벧전', '벧후', '요일', '요이', '요삼', '유'] },
      { title: '예언서', codes: ['계'] },
    ],
  },
];

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function getTodayIsoDate() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000);

  return localDate.toISOString().slice(0, 10);
}

function toIsoDate(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);

  return localDate.toISOString().slice(0, 10);
}

function parseIsoDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);

  return new Date(year, month - 1, day);
}

function formatKoreanDate(date: string) {
  const parsedDate = parseIsoDate(date);
  const weekday = WEEKDAYS[parsedDate.getDay()];

  return `${parsedDate.getFullYear()}년 ${parsedDate.getMonth() + 1}월 ${parsedDate.getDate()}일 (${weekday})`;
}

function createCalendarCells(year: number, monthIndex: number) {
  const firstDate = new Date(year, monthIndex, 1);
  const lastDate = new Date(year, monthIndex + 1, 0);
  const cells: Array<Date | null> = [];

  for (let i = 0; i < firstDate.getDay(); i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= lastDate.getDate(); day += 1) {
    cells.push(new Date(year, monthIndex, day));
  }

  return cells;
}

function orderBookCodes(bookCodes: string[]) {
  const selected = new Set(bookCodes);

  return BIBLE_BOOKS.filter((book) => selected.has(book.id)).map((book) => book.id);
}

export default function NewReadingPlanPage() {
  const router = useRouter();
  const { authMode, signInWithKakao } = useAuth();
  const [selectedBookCodes, setSelectedBookCodes] = useState<string[]>([]);
  const [dailyChapterTargetInput, setDailyChapterTargetInput] = useState('1');
  const [startDate, setStartDate] = useState(getTodayIsoDate);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = parseIsoDate(getTodayIsoDate());
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [title, setTitle] = useState('나의 통독');
  const [isTitleTouched, setIsTitleTouched] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const orderedBookCodes = useMemo(() => orderBookCodes(selectedBookCodes), [selectedBookCodes]);
  const parsedDailyChapterTarget = Number(dailyChapterTargetInput);
  const dailyChapterTarget =
    Number.isInteger(parsedDailyChapterTarget) &&
    parsedDailyChapterTarget >= 1 &&
    parsedDailyChapterTarget <= 10
      ? parsedDailyChapterTarget
      : null;
  const totalChapterCount = getSelectedChapterCount(orderedBookCodes);
  const estimatedDays =
    totalChapterCount === 0 || !dailyChapterTarget
      ? 0
      : Math.ceil(totalChapterCount / dailyChapterTarget);
  const canSubmit =
    authMode === 'authenticated' &&
    orderedBookCodes.length > 0 &&
    title.trim().length > 0 &&
    dailyChapterTarget !== null &&
    !isSubmitting;

  useEffect(() => {
    if (!isTitleTouched) {
      setTitle(getDefaultReadingPlanTitle(orderedBookCodes));
    }
  }, [isTitleTouched, orderedBookCodes]);

  useEffect(() => {
    const selectedDate = parseIsoDate(startDate);
    setVisibleMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [startDate]);

  const handleToggleBook = (bookCode: string) => {
    setSelectedBookCodes((current) => {
      const selected = new Set(current);

      if (selected.has(bookCode)) {
        selected.delete(bookCode);
      } else {
        selected.add(bookCode);
      }

      return orderBookCodes(Array.from(selected));
    });
  };

  const handleSelectBooks = (books: BibleBook[]) => {
    setSelectedBookCodes(orderBookCodes(books.map((book) => book.id)));
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await createReadingPlan({
        title: title.trim(),
        bookCodes: orderedBookCodes,
        dailyChapterTarget,
        startDate,
      });
      router.push('/reading?created=1');
    } catch (error) {
      if (isApiError(error) && error.code === 'CONFLICT') {
        setMessage('현재는 하나의 통독 계획만 진행할 수 있어요. 기존 계획을 완료하거나 삭제해주세요.');
      } else {
        setMessage(getApiErrorMessage(error, '통독 계획을 만들지 못했어요. 다시 시도해 주세요.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F0EEE7] px-5 pb-[148px] pt-7">
      <div className="mx-auto max-w-sm">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로 가기"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-[#414141] active:bg-[#E8E4DC]"
        >
          <ChevronLeft size={25} />
        </button>

        <header className="mt-8">
          <h1 className="break-keep text-[30px] font-bold leading-tight tracking-[-0.02em] text-[#343434]">
            나만의 통독을 만들어볼게요
          </h1>
          <p className="mt-3 break-keep text-[14px] font-semibold leading-relaxed text-[#8D8881]">
            책 단위로 선택하고, 하루에 읽을 장 수를 정해주세요.
          </p>
        </header>

        {authMode === 'guest' ? (
          <section className="mt-8 rounded-[20px] bg-white px-5 py-6">
            <p className="break-keep text-[18px] font-bold text-[#343434]">
              로그인하면 통독 계획을 만들 수 있어요.
            </p>
            <button
              type="button"
              onClick={signInWithKakao}
              className="mt-5 h-12 w-full rounded-full bg-[#343434] text-[15px] font-bold text-white"
            >
              카카오로 로그인
            </button>
          </section>
        ) : (
          <>
            <section className="mt-8 rounded-[20px] bg-white px-5 py-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[17px] font-bold text-[#343434]">읽을 책</h2>
                <span className="text-[13px] font-bold text-[#A88A63]">
                  총 {orderedBookCodes.length}권 선택됨
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <QuickSelectButton label="성경 전체" onClick={() => handleSelectBooks(BIBLE_BOOKS)} />
                <QuickSelectButton label="구약 전체" onClick={() => handleSelectBooks(OLD_TESTAMENT_BOOKS)} />
                <QuickSelectButton label="신약 전체" onClick={() => handleSelectBooks(NEW_TESTAMENT_BOOKS)} />
              </div>

              <div className="mt-6 space-y-7">
                {BOOK_GROUPS.map((group) => (
                  <div key={group.testament}>
                    <p className="mb-4 text-[15px] font-bold text-[#343434]">{group.testament}</p>
                    <div className="space-y-5">
                      {group.sections.map((section) => (
                        <div key={`${group.testament}-${section.title}`}>
                          <p className="mb-2 text-[13px] font-bold text-[#8D8881]">{section.title}</p>
                          <div className="flex flex-wrap gap-2">
                            {section.codes.map((bookCode) => {
                              const book = BIBLE_BOOKS.find((candidate) => candidate.id === bookCode);
                              const selected = selectedBookCodes.includes(bookCode);

                              if (!book) {
                                return null;
                              }

                              return (
                                <button
                                  key={book.id}
                                  type="button"
                                  onClick={() => handleToggleBook(book.id)}
                                  className={`flex h-10 items-center gap-1.5 rounded-[10px] border px-3 text-[14px] font-bold transition active:scale-[0.98] ${
                                    selected
                                      ? 'border-[#A88A63] bg-[#F2EBE2] text-[#7A6048]'
                                      : 'border-[#D8D1C3] bg-white text-[#8D8881]'
                                  }`}
                                >
                                  {selected && <Check size={15} strokeWidth={2.6} />}
                                  {book.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-5 rounded-[20px] bg-white px-5 py-5">
              <h2 className="text-[17px] font-bold text-[#343434]">목표 일정</h2>

              <label className="mt-5 block">
                <span className="text-[13px] font-bold text-[#8D8881]">하루에 몇 장씩 읽을까요?</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={10}
                  value={dailyChapterTargetInput}
                  onChange={(event) => {
                    const nextValue = event.target.value.replace(/\D/g, '').slice(0, 2);
                    setDailyChapterTargetInput(nextValue);
                  }}
                  onBlur={() => {
                    const nextValue = Number(dailyChapterTargetInput);

                    if (!Number.isInteger(nextValue) || nextValue < 1) {
                      setDailyChapterTargetInput('1');
                      return;
                    }

                    if (nextValue > 10) {
                      setDailyChapterTargetInput('10');
                    }
                  }}
                  className="mt-2 h-[52px] w-full rounded-[14px] border border-[#D8D1C3] bg-white px-4 text-center text-[22px] font-bold text-[#343434] outline-none focus:border-[#A88A63]"
                />
                <p className="mt-2 text-[12px] font-semibold text-[#8D8881]">
                  하루 목표는 1장부터 10장까지 설정할 수 있어요.
                </p>
              </label>

              <label className="mt-5 block">
                <span className="text-[13px] font-bold text-[#8D8881]">시작일</span>
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen((current) => !current)}
                  className="mt-2 flex h-[52px] w-full items-center gap-3 rounded-[14px] border border-[#D8D1C3] bg-white px-4 text-left active:bg-[#F8F6F1]"
                >
                  <CalendarDays size={18} className="text-[#A88A63]" />
                  <span className="min-w-0 flex-1 text-[16px] font-bold text-[#343434]">
                    {formatKoreanDate(startDate)}
                  </span>
                  <ChevronRight
                    size={18}
                    className={`shrink-0 text-[#A88A63] transition-transform ${isDatePickerOpen ? 'rotate-90' : ''}`}
                  />
                </button>
              </label>

              {isDatePickerOpen && (
                <StartDateCalendar
                  selectedDate={startDate}
                  visibleMonth={visibleMonth}
                  onVisibleMonthChange={setVisibleMonth}
                  onSelectDate={(date) => {
                    setStartDate(date);
                    setIsDatePickerOpen(false);
                  }}
                />
              )}
            </section>

            <section className="mt-5 rounded-[20px] bg-white px-5 py-5">
              <h2 className="text-[17px] font-bold text-[#343434]">통독 이름</h2>
              <input
                type="text"
                value={title}
                maxLength={100}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setIsTitleTouched(true);
                }}
                className="mt-3 h-[52px] w-full rounded-[14px] border border-[#D8D1C3] bg-white px-4 text-[17px] font-bold text-[#343434] outline-none focus:border-[#A88A63]"
              />
            </section>

            <section className="mt-5 rounded-[20px] bg-[#343434] px-5 py-5 text-white">
              <p className="text-[13px] font-bold text-white/60">생성 전 요약</p>
              <p className="mt-2 break-keep text-[19px] font-bold leading-relaxed">
                {orderedBookCodes.length > 0
                  ? `${orderedBookCodes.length}권, 총 ${totalChapterCount}장을 읽어요.`
                  : '읽을 책을 선택해주세요.'}
              </p>
              <p className="mt-2 text-[13px] font-semibold text-white/70">
                {estimatedDays > 0
                  ? `${startDate} 시작 · 하루 ${dailyChapterTarget}장 · 예상 ${estimatedDays}일`
                  : '선택한 책에 따라 예상 기간을 계산해요.'}
              </p>
            </section>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#A88A63] text-[17px] font-bold text-white shadow-[0_8px_24px_rgba(77,63,46,0.16)] transition active:scale-[0.98] disabled:bg-[#D8D1C3] disabled:text-white/80"
            >
              {isSubmitting && <Loader2 size={18} className="animate-spin" />}
              완료
            </button>

            {message && (
              <p className="mt-4 break-keep rounded-[14px] bg-[#F7E8E2] px-4 py-3 text-[13px] font-bold leading-relaxed text-[#A35F4D]">
                {message}
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function QuickSelectButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-10 rounded-[10px] bg-[#F0EEE7] text-[13px] font-bold text-[#7A6048] active:scale-[0.98]"
    >
      {label}
    </button>
  );
}

function StartDateCalendar({
  selectedDate,
  visibleMonth,
  onVisibleMonthChange,
  onSelectDate,
}: {
  selectedDate: string;
  visibleMonth: Date;
  onVisibleMonthChange: (date: Date) => void;
  onSelectDate: (date: string) => void;
}) {
  const todayKey = getTodayIsoDate();
  const selectedDateKey = selectedDate;
  const year = visibleMonth.getFullYear();
  const monthIndex = visibleMonth.getMonth();
  const calendarCells = createCalendarCells(year, monthIndex);

  const moveMonth = (offset: number) => {
    onVisibleMonthChange(new Date(year, monthIndex + offset, 1));
  };

  return (
    <div className="mt-3 rounded-[18px] bg-[#FBFAF7] px-4 py-4 shadow-[inset_0_0_0_1px_rgba(216,209,195,0.72)]">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => moveMonth(-1)}
          aria-label="이전 달"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#6E6A63] active:bg-[#F0EEE7]"
        >
          <ChevronLeft size={21} />
        </button>

        <div className="text-center">
          <p className="text-[11px] font-semibold text-[#8D8881]">{year}</p>
          <h3 className="text-[24px] font-bold leading-none text-[#343434]">
            {monthIndex + 1}월
          </h3>
        </div>

        <button
          type="button"
          onClick={() => moveMonth(1)}
          aria-label="다음 달"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#6E6A63] active:bg-[#F0EEE7]"
        >
          <ChevronRight size={21} />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[12px] font-bold text-[#8D8881]">
        {WEEKDAYS.map((weekday, index) => (
          <div
            key={weekday}
            className={index === 0 ? 'text-[#B68176]' : index === 6 ? 'text-[#7C8799]' : ''}
          >
            {weekday}
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-y-1">
        {calendarCells.map((cell, index) => {
          if (!cell) {
            return <div key={`empty-${index}`} className="h-11" />;
          }

          const dateKey = toIsoDate(cell);
          const selected = selectedDateKey === dateKey;
          const today = todayKey === dateKey;

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelectDate(dateKey)}
              className="flex h-11 items-center justify-center rounded-[12px] transition-colors active:bg-[#F4F0E8]"
              aria-pressed={selected}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[15px] font-semibold ${
                  selected
                    ? 'bg-[#343434] text-white'
                    : today
                      ? 'bg-[#E8DED0] text-[#7A6048]'
                      : 'text-[#414141]'
                }`}
              >
                {cell.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => onSelectDate(todayKey)}
          className="rounded-full px-3 py-2 text-[12px] font-bold text-[#A88A63] active:bg-[#F0EEE7]"
        >
          오늘로 설정
        </button>
      </div>
    </div>
  );
}
