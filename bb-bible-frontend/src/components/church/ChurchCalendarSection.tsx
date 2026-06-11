'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import {
  formatChurchEventDate,
  formatChurchEventShortDate,
  getChurchEventsByDate,
  getChurchEventsByMonth,
  getUpcomingChurchEvents,
  isDateInChurchEvent,
  toDateKey,
  type ChurchEvent,
  type ChurchEventType,
} from '@/data/church-events';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const EVENT_TYPE_STYLE: Record<ChurchEventType, { label: string; badge: string }> = {
  worship: {
    label: '예배',
    badge: 'bg-[#E8DED0] text-[#7A6048]',
  },
  meeting: {
    label: '모임',
    badge: 'bg-[#DFE8E2] text-[#5B7567]',
  },
  notice: {
    label: '안내',
    badge: 'bg-[#ECE8DE] text-[#756D61]',
  },
  education: {
    label: '교육',
    badge: 'bg-[#E6E1D8] text-[#6E604E]',
  },
};

export default function ChurchCalendarSection() {
  const todayKey = toDateKey(new Date());
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);

  const year = visibleMonth.getFullYear();
  const monthIndex = visibleMonth.getMonth();
  const monthEvents = useMemo(
    () => getChurchEventsByMonth(year, monthIndex),
    [year, monthIndex],
  );
  const upcomingEvents = useMemo(() => getUpcomingChurchEvents(3), []);
  const selectedEvents = useMemo(
    () => getChurchEventsByDate(selectedDateKey),
    [selectedDateKey],
  );
  const calendarCells = useMemo(
    () => createCalendarCells(year, monthIndex),
    [year, monthIndex],
  );

  const moveMonth = (offset: number) => {
    setVisibleMonth((current) => {
      const next = new Date(current.getFullYear(), current.getMonth() + offset, 1);
      setSelectedDateKey(toDateKey(next));
      return next;
    });
  };

  return (
    <section>
      <div className="mb-3 flex items-end justify-between px-1">
        <div>
          <p className="text-[12px] font-semibold text-[#8D8881]">아름다운 우리교회</p>
          <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#343434]">
            일정 캘린더
          </h2>
        </div>
        <span className="text-[12px] font-semibold text-[#8D8881]">
          {monthEvents.length}개 일정
        </span>
      </div>

      <UpcomingEventsCard events={upcomingEvents} />

      <div className="rounded-[18px] bg-white px-4 py-4 shadow-[0_1px_4px_rgba(65,65,65,0.08)]">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            aria-label="이전 달"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#6E6A63] active:bg-[#F0EEE7]"
          >
            <ChevronLeft size={22} />
          </button>

          <div className="text-center">
            <p className="text-[12px] font-semibold text-[#8D8881]">{year}</p>
            <h3 className="text-[28px] font-bold leading-none text-[#343434]">
              {monthIndex + 1}월
            </h3>
          </div>

          <button
            type="button"
            onClick={() => moveMonth(1)}
            aria-label="다음 달"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#6E6A63] active:bg-[#F0EEE7]"
          >
            <ChevronRight size={22} />
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
              return <div key={`empty-${index}`} className="h-14" />;
            }

            const dateKey = toDateKey(cell);
            const selected = selectedDateKey === dateKey;
            const today = todayKey === dateKey;
            const hasEvent = monthEvents.some((event) => isDateInChurchEvent(dateKey, event));

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => setSelectedDateKey(dateKey)}
                className="flex h-14 flex-col items-center justify-center rounded-[14px] transition-colors active:bg-[#F4F0E8]"
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
                <span className="mt-1 flex h-1.5 items-center justify-center">
                  {hasEvent && <span className="h-1.5 w-3 rounded-full bg-[#B69A60]" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between px-1">
          <h3 className="text-[17px] font-bold text-[#343434]">
            {formatChurchEventDate(selectedDateKey)}
          </h3>
          <span className="text-[12px] font-semibold text-[#8D8881]">
            {selectedEvents.length}개
          </span>
        </div>

        {selectedEvents.length > 0 ? (
          <div className="space-y-3">
            {selectedEvents.map((event) => (
              <ChurchEventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="rounded-[18px] bg-white px-5 py-8 text-center shadow-[0_1px_4px_rgba(65,65,65,0.08)]">
            <CalendarDays size={26} className="mx-auto text-[#C2BFB8]" />
            <p className="mt-3 text-[14px] font-bold text-[#414141]">
              등록된 일정이 없어요
            </p>
            <p className="mt-1 break-keep text-[12px] font-semibold leading-relaxed text-[#8D8881]">
              다른 날짜를 눌러 이번 달 일정을 확인해보세요.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function UpcomingEventsCard({ events }: { events: ChurchEvent[] }) {
  return (
    <div className="mb-5 rounded-[18px] bg-white px-5 py-4 shadow-[0_1px_4px_rgba(65,65,65,0.08)]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-[#343434]">다가오는 일정</h3>
        <span className="text-[11px] font-semibold text-[#8D8881]">가까운 순</span>
      </div>

      {events.length > 0 ? (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="flex items-start gap-3">
              <span className="flex h-10 w-12 shrink-0 items-center justify-center rounded-[12px] bg-[#E8DED0] text-[12px] font-bold text-[#7A6048]">
                {formatChurchEventShortDate(event.date, event.endDate)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-bold text-[#343434]">
                  {event.title}
                </span>
                <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[12px] font-semibold text-[#7A746B]">
                  {event.time && (
                    <span className="inline-flex items-center gap-1">
                      <Clock size={13} />
                      {event.time}
                    </span>
                  )}
                  {event.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={13} />
                      {event.location}
                    </span>
                  )}
                </span>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="break-keep text-[13px] font-semibold leading-relaxed text-[#8D8881]">
          다가오는 일정이 없어요.
        </p>
      )}
    </div>
  );
}

function ChurchEventCard({ event }: { event: ChurchEvent }) {
  const style = EVENT_TYPE_STYLE[event.type];

  return (
    <article className="rounded-[18px] bg-white px-5 py-4 shadow-[0_1px_4px_rgba(65,65,65,0.08)]">
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${style.badge}`}>
          {style.label}
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="text-[16px] font-bold text-[#343434]">{event.title}</h4>
          {event.endDate && (
            <p className="mt-1 text-[12px] font-semibold text-[#8D8881]">
              {formatChurchEventShortDate(event.date, event.endDate)}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px] font-semibold text-[#7A746B]">
            {event.time && (
              <span className="inline-flex items-center gap-1">
                <Clock size={14} />
                {event.time}
              </span>
            )}
            {event.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={14} />
                {event.location}
              </span>
            )}
          </div>
          {event.description && (
            <p className="mt-3 break-keep text-[13px] font-medium leading-relaxed text-[#6E6A63]">
              {event.description}
            </p>
          )}
        </div>
      </div>
    </article>
  );
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
