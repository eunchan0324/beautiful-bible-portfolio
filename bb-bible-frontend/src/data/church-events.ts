export type ChurchEventType = 'worship' | 'meeting' | 'notice' | 'education';

export interface ChurchEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  time?: string;
  location?: string;
  description?: string;
  type: ChurchEventType;
}

// 실제 교회 일정이 확정되면 이 배열만 수정하면 됩니다.
// date는 YYYY-MM-DD 형식으로 적습니다.
export const CHURCH_EVENTS: ChurchEvent[] = [
  {
    id: '2026-06-01-mountain-mission',
    title: '등산선교회',
    date: '2026-06-01',
    type: 'meeting',
  },
  {
    id: '2026-06-04-ilsan-presbytery-meeting',
    title: '서울북노회 일산시찰회 모임',
    date: '2026-06-04',
    location: '식사 교회',
    type: 'meeting',
  },
  {
    id: '2026-06-05-brazil-dts-outreach',
    title: '브라질 DTS팀 전도여행팀',
    date: '2026-06-05',
    endDate: '2026-06-12',
    type: 'notice',
  },
  {
    id: '2026-06-06-brazil-team-love-house',
    title: '브라질팀 사랑의집 고기파티',
    date: '2026-06-06',
    type: 'meeting',
  },
  {
    id: '2026-06-07-brazil-team-joint-worship',
    title: '브라질팀 연합 예배',
    date: '2026-06-07',
    time: '오전, 오후',
    type: 'worship',
  },
  {
    id: '2026-06-07-presbytery-clergy-meeting',
    title: '서울북노회 교직자회 모임',
    date: '2026-06-07',
    location: '예수인교회',
    type: 'meeting',
  },
  {
    id: '2026-06-08-yoo-haeseok-retirement',
    title: '유해석 교수 정년퇴임',
    date: '2026-06-08',
    location: '총신대',
    type: 'notice',
  },
  {
    id: '2026-06-08-brazil-team-sharing',
    title: '브라질팀 나눔',
    date: '2026-06-08',
    type: 'meeting',
  },
  {
    id: '2026-06-09-brazil-team-sharing',
    title: '브라질팀 나눔',
    date: '2026-06-09',
    type: 'meeting',
  },
  {
    id: '2026-06-10-brazil-joint-wednesday-worship',
    title: '수요예배',
    date: '2026-06-10',
    description: '브라질팀 연합',
    type: 'worship',
  },
  {
    id: '2026-06-11-brazil-team-farewell',
    title: '브라질팀 송별',
    date: '2026-06-11',
    type: 'meeting',
  },
  {
    id: '2026-06-12-harim-friday-prayer',
    title: '하림교회 금요기도회 말씀 인도',
    date: '2026-06-12',
    type: 'worship',
  },
  {
    id: '2026-06-15-presbytery-pastors-retreat',
    title: '서울북노회 목우회 수련회',
    date: '2026-06-15',
    endDate: '2026-06-16',
    location: '포천',
    description: '1박 2일',
    type: 'meeting',
  },
  {
    id: '2026-06-17-goyang-foreign-language-high-school',
    title: '고양외고 신우회 말씀 인도',
    date: '2026-06-17',
    type: 'meeting',
  },
  {
    id: '2026-06-26-family-praise-worship',
    title: '가족찬양예배',
    date: '2026-06-26',
    type: 'worship',
  },
  {
    id: '2026-06-28-nepal-missionary-invitation',
    title: '이해덕 조현경 네팔 선교사님 초청 예배',
    date: '2026-06-28',
    type: 'worship',
  },
];

export function getUpcomingChurchEvents(limit = 3, from = new Date()) {
  const todayKey = toDateKey(from);

  return [...CHURCH_EVENTS]
    .filter((event) => (event.endDate ?? event.date) >= todayKey)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}

export function getChurchEventsByDate(dateKey: string) {
  return CHURCH_EVENTS
    .filter((event) => isDateInChurchEvent(dateKey, event))
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? ''));
}

export function getChurchEventsByMonth(year: number, monthIndex: number) {
  const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
  const monthStart = `${monthKey}-01`;
  const monthEnd = `${monthKey}-${String(new Date(year, monthIndex + 1, 0).getDate()).padStart(2, '0')}`;

  return CHURCH_EVENTS.filter((event) => {
    const eventEndDate = event.endDate ?? event.date;
    return event.date <= monthEnd && eventEndDate >= monthStart;
  });
}

export function isDateInChurchEvent(dateKey: string, event: ChurchEvent) {
  return event.date <= dateKey && dateKey <= (event.endDate ?? event.date);
}

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatChurchEventDate(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);

  return `${year}년 ${month}월 ${day}일`;
}

export function formatChurchEventShortDate(dateKey: string, endDateKey?: string) {
  const [, month, day] = dateKey.split('-').map(Number);

  if (!endDateKey || endDateKey === dateKey) {
    return `${month}.${day}`;
  }

  const [, endMonth, endDay] = endDateKey.split('-').map(Number);

  return month === endMonth ? `${month}.${day}-${endDay}` : `${month}.${day}-${endMonth}.${endDay}`;
}
