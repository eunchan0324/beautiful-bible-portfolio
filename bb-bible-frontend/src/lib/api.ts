import { supabase } from '@/lib/supabase';
import { throwApiError } from '@/lib/api-error';
import { HighlightColor, ThemeMode } from '@/types/bible';
import type { SearchPage, SearchVerseItem } from '@/types/search';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');

if (!apiBaseUrl) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is missing.');
}

export interface UserMeResponse {
  id: string;
  email: string | null;
  nickname: string | null;
  role: string;
}

export interface HealthResponse {
  status: string;
}

export interface TodayVerseResponse {
  verseKey: string;
  bookCode: string;
  chapterNum: number;
  verseNum: number;
  verseText: string;
  theme: string;
}

export interface PushSubscriptionRequest {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface UpdateUserMeRequest {
  nickname: string;
}

export interface HighlightResponse {
  id: number;
  verseKey: string;
  color: HighlightColor;
  note: string | null;
  createdAt: string;
}

export interface HighlightRequest {
  verseKey: string;
  color: HighlightColor;
  note?: string | null;
}

export interface HighlightSyncRequest {
  highlights: HighlightRequest[];
}

export interface SavedVerseResponse {
  verseKey: string;
  bookCode: string;
  bookName: string;
  chapterNum: number;
  verseNum: number;
  verseText: string;
  createdAt: string;
}

export interface ChapterSummaryResponse {
  bookCode: string;
  chapterNum: number;
  summary: string;
  model: string | null;
}

export interface BookSummaryResponse {
  bookCode: string;
  shortSummary: string;
  summary: string;
  readingPoint: string;
  keywords: string[];
  outline: string[];
  model: string | null;
}

export interface PersonStoryStepResponse {
  title: string;
  summary: string;
  verseKeys: string[];
}

export interface PersonKeyVerseResponse {
  verseKey: string;
  label: string;
}

export interface PersonCommentaryListItemResponse {
  personCode: string;
  name: string;
  shortDescription: string;
  keywords: string[];
}

export interface PersonCommentaryDetailResponse {
  personCode: string;
  name: string;
  shortDescription: string;
  description: string;
  storyFlow: PersonStoryStepResponse[];
  keyVerses: PersonKeyVerseResponse[];
  relatedBooks: string[];
  keywords: string[];
}

export type ReadingPlanStatus = 'IN_PROGRESS' | 'COMPLETED';

export interface ReadingPlanItemResponse {
  dayNumber: number;
  bookCode: string;
  chapterNum: number;
  itemOrder: number;
}

export interface ReadingProgressResponse {
  bookCode: string;
  chapterNum: number;
  completedAt: string;
}

export interface ReadingPlanResponse {
  id: number;
  title: string;
  startDate: string;
  dailyChapterTarget: number;
  status: ReadingPlanStatus;
  items: ReadingPlanItemResponse[];
  completedChapters: ReadingProgressResponse[];
}

export interface CreateReadingPlanRequest {
  title: string;
  bookCodes: string[];
  dailyChapterTarget: number;
  startDate: string;
}

export interface CreateReadingPlanResponse {
  id: number;
  title: string;
  startDate: string;
  dailyChapterTarget: number;
  status: ReadingPlanStatus;
}

export interface CompleteReadingChapterResponse {
  planId: number;
  bookCode: string;
  chapterNum: number;
  completedAt: string;
}

type ApiThemeMode = 'SYSTEM' | 'LIGHT' | 'DARK';

export interface PreferenceResponse {
  fontSize: string;
  themeMode: ApiThemeMode;
  showVerseNumbers: boolean;
}

export interface PreferenceRequest {
  fontSize: string;
  themeMode: ApiThemeMode;
  showVerseNumbers: boolean;
}

export interface ReadingPreferences {
  fontSize: string;
  themeMode: ThemeMode;
  showVerseNumbers: boolean;
}

function toApiThemeMode(themeMode: ThemeMode): ApiThemeMode {
  return themeMode.toUpperCase() as ApiThemeMode;
}

function fromApiThemeMode(themeMode: ApiThemeMode): ThemeMode {
  return themeMode.toLowerCase() as ThemeMode;
}

export function toReadingPreferences(response: PreferenceResponse): ReadingPreferences {
  return {
    fontSize: response.fontSize,
    themeMode: fromApiThemeMode(response.themeMode),
    showVerseNumbers: response.showVerseNumbers,
  };
}

export function toPreferenceRequest(preferences: ReadingPreferences): PreferenceRequest {
  return {
    fontSize: preferences.fontSize,
    themeMode: toApiThemeMode(preferences.themeMode),
    showVerseNumbers: preferences.showVerseNumbers,
  };
}

async function getAccessToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  if (!accessToken) {
    throw new Error('로그인이 필요해요.');
  }

  return accessToken;
}

async function fetchWithAuth(path: string, options: RequestInit = {}): Promise<Response> {
  const accessToken = await getAccessToken();
  const headers = new Headers(options.headers);

  headers.set('Authorization', `Bearer ${accessToken}`);

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  });
}

async function ensureOk(response: Response, fallbackMessage = 'API request failed.'): Promise<void> {
  if (!response.ok) {
    await throwApiError(response, `${fallbackMessage} (${response.status})`);
  }
}

export async function fetchUserMe(): Promise<UserMeResponse> {
  const response = await fetchWithAuth('/api/v1/users/me');

  await ensureOk(response, '사용자 정보를 불러오지 못했어요.');

  return response.json();
}

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${apiBaseUrl}/api/v1/health`);

  await ensureOk(response, '서버 상태를 확인하지 못했어요.');

  return response.json();
}

export async function fetchTodayVerse(): Promise<TodayVerseResponse> {
  const response = await fetch(`${apiBaseUrl}/api/v1/today-verse`);

  await ensureOk(response, '오늘의 말씀을 불러오지 못했어요.');

  return response.json();
}

export async function savePushSubscription(
  request: PushSubscriptionRequest,
): Promise<void> {
  const response = await fetchWithAuth('/api/v1/push-subscriptions', {
    method: 'POST',
    body: JSON.stringify(request),
  });

  await ensureOk(response, '오늘의 말씀 알림 구독을 저장하지 못했어요.');
}

export async function deletePushSubscription(
  request: PushSubscriptionRequest,
): Promise<void> {
  const response = await fetchWithAuth('/api/v1/push-subscriptions', {
    method: 'DELETE',
    body: JSON.stringify(request),
  });

  await ensureOk(response, '오늘의 말씀 알림 구독을 해제하지 못했어요.');
}

export async function updateUserMe(request: UpdateUserMeRequest): Promise<UserMeResponse> {
  const response = await fetchWithAuth('/api/v1/users/me', {
    method: 'PUT',
    body: JSON.stringify(request),
  });

  await ensureOk(response, '프로필을 저장하지 못했어요.');

  return response.json();
}

export async function fetchSavedVerses(): Promise<SavedVerseResponse[]> {
  const response = await fetchWithAuth('/api/v1/saved-verses');

  await ensureOk(response, '저장한 말씀을 불러오지 못했어요.');

  return response.json();
}

export async function createSavedVerse(verseKey: string): Promise<SavedVerseResponse> {
  const response = await fetchWithAuth('/api/v1/saved-verses', {
    method: 'POST',
    body: JSON.stringify({ verseKey }),
  });

  await ensureOk(response, '말씀을 저장하지 못했어요.');

  return response.json();
}

export async function deleteSavedVerse(verseKey: string): Promise<void> {
  const response = await fetchWithAuth(`/api/v1/saved-verses/${encodeURIComponent(verseKey)}`, {
    method: 'DELETE',
  });

  await ensureOk(response, '저장한 말씀을 삭제하지 못했어요.');
}

export async function fetchHighlights(): Promise<HighlightResponse[]> {
  const response = await fetchWithAuth('/api/v1/highlights');

  await ensureOk(response, '하이라이트를 불러오지 못했어요.');

  return response.json();
}

export async function createHighlight(request: HighlightRequest): Promise<HighlightResponse> {
  const response = await fetchWithAuth('/api/v1/highlights', {
    method: 'POST',
    body: JSON.stringify(request),
  });

  await ensureOk(response, '하이라이트를 저장하지 못했어요.');

  return response.json();
}

export async function updateHighlight(
  verseKey: string,
  request: HighlightRequest,
): Promise<HighlightResponse> {
  const response = await fetchWithAuth(`/api/v1/highlights/${encodeURIComponent(verseKey)}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  });

  await ensureOk(response, '하이라이트를 수정하지 못했어요.');

  return response.json();
}

export async function deleteHighlight(verseKey: string): Promise<void> {
  const response = await fetchWithAuth(`/api/v1/highlights/${encodeURIComponent(verseKey)}`, {
    method: 'DELETE',
  });

  await ensureOk(response, '하이라이트를 삭제하지 못했어요.');
}

export async function syncHighlights(
  request: HighlightSyncRequest,
): Promise<HighlightResponse[]> {
  const response = await fetchWithAuth('/api/v1/highlights/sync', {
    method: 'POST',
    body: JSON.stringify(request),
  });

  await ensureOk(response, '하이라이트를 동기화하지 못했어요.');

  return response.json();
}

export async function fetchPreferences(): Promise<PreferenceResponse> {
  const response = await fetchWithAuth('/api/v1/preferences');

  await ensureOk(response, '설정을 불러오지 못했어요.');

  return response.json();
}

export async function fetchChapterSummary(
  bookCode: string,
  chapterNum: number,
): Promise<ChapterSummaryResponse | null> {
  const response = await fetch(
    `${apiBaseUrl}/api/v1/bible/books/${encodeURIComponent(bookCode)}/chapters/${chapterNum}/summary`,
  );

  if (response.status === 404) {
    return null;
  }

  await ensureOk(response, '장 요약을 불러오지 못했어요.');

  return response.json();
}

export async function fetchBookSummary(
  bookCode: string,
): Promise<BookSummaryResponse | null> {
  const response = await fetch(
    `${apiBaseUrl}/api/v1/bible/books/${encodeURIComponent(bookCode)}/summary`,
  );

  if (response.status === 404) {
    return null;
  }

  await ensureOk(response, '책 요약을 불러오지 못했어요.');

  return response.json();
}

export async function fetchPersonCommentaries(): Promise<PersonCommentaryListItemResponse[]> {
  const response = await fetch(`${apiBaseUrl}/api/v1/commentaries/persons`);

  await ensureOk(response, '인물 해설을 불러오지 못했어요.');

  return response.json();
}

export async function fetchPersonCommentary(
  personCode: string,
): Promise<PersonCommentaryDetailResponse | null> {
  const response = await fetch(
    `${apiBaseUrl}/api/v1/commentaries/persons/${encodeURIComponent(personCode)}`,
  );

  if (response.status === 404) {
    return null;
  }

  await ensureOk(response, '인물 해설을 불러오지 못했어요.');

  return response.json();
}

export async function fetchMyReadingPlan(): Promise<ReadingPlanResponse | null> {
  const response = await fetchWithAuth('/api/v1/reading-plans/me');

  if (response.status === 404) {
    return null;
  }

  await ensureOk(response, '통독 계획을 불러오지 못했어요.');

  return normalizeReadingPlanResponse(await response.json());
}

function normalizeReadingPlanResponse(response: ReadingPlanResponse): ReadingPlanResponse {
  return {
    ...response,
    items: response.items ?? [],
    completedChapters: response.completedChapters ?? [],
  };
}

export async function createReadingPlan(
  request: CreateReadingPlanRequest,
): Promise<CreateReadingPlanResponse> {
  const response = await fetchWithAuth('/api/v1/reading-plans', {
    method: 'POST',
    body: JSON.stringify(request),
  });

  await ensureOk(response, '통독 계획을 만들지 못했어요.');

  return response.json();
}

export async function deleteReadingPlan(planId: number): Promise<void> {
  const response = await fetchWithAuth(`/api/v1/reading-plans/${planId}`, {
    method: 'DELETE',
  });

  await ensureOk(response, '통독 계획을 삭제하지 못했어요.');
}

export async function completeReadingChapter(
  planId: number,
  request: {
    bookCode: string;
    chapterNum: number;
  },
): Promise<CompleteReadingChapterResponse> {
  const response = await fetchWithAuth(`/api/v1/reading-plans/${planId}/progress`, {
    method: 'POST',
    body: JSON.stringify(request),
  });

  await ensureOk(response, '읽음 완료를 저장하지 못했어요.');

  return response.json();
}

export async function updatePreferences(
  request: PreferenceRequest,
): Promise<PreferenceResponse> {
  const response = await fetchWithAuth('/api/v1/preferences', {
    method: 'PUT',
    body: JSON.stringify(request),
  });

  await ensureOk(response, '설정을 저장하지 못했어요.');

  return response.json();
}

export async function searchVerses(params: {
  q: string;
  page?: number;
  size?: number;
  signal?: AbortSignal;
}): Promise<SearchPage<SearchVerseItem>> {
  const { q, page = 0, size = 20, signal } = params;
  const url = new URL(`${apiBaseUrl}/api/v1/search`);

  url.searchParams.set('q', q);
  url.searchParams.set('page', String(page));
  url.searchParams.set('size', String(size));

  const response = await fetch(url.toString(), { signal });

  await ensureOk(response, '검색에 실패했어요.');

  return response.json();
}
