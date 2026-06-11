'use client';

import { useEffect, useState } from 'react';
import { Bell, LogOut, Moon, SunMedium, Type } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MyPageHeader from '@/components/my/MyPageHeader';
import MyRow from '@/components/my/MyRow';
import { useAuth } from '@/hooks/use-auth';
import {
  getTodayVerseNotificationStatusMessage,
  useTodayVerseNotification,
} from '@/hooks/use-today-verse-notification';
import {
  fetchPreferences,
  ReadingPreferences,
  toPreferenceRequest,
  toReadingPreferences,
  updatePreferences,
} from '@/lib/api';
import type { ThemeMode } from '@/types/bible';

const FONT_SIZE_STORAGE_KEY = 'bb-bible-font-size';
const READING_THEME_STORAGE_KEY = 'bb-bible-reading-theme';

const DEFAULT_PREFERENCES: ReadingPreferences = {
  fontSize: 'small',
  themeMode: 'system',
  showVerseNumbers: true,
};

export default function SettingsPage() {
  const router = useRouter();
  const { authMode, isAuthenticated, signOut } = useAuth();
  const [preferences, setPreferences] = useState<ReadingPreferences>(DEFAULT_PREFERENCES);
  const [status, setStatus] = useState<'idle' | 'saving'>('idle');
  const [isLogoutSheetOpen, setIsLogoutSheetOpen] = useState(false);
  const todayVerseNotification = useTodayVerseNotification();

  useEffect(() => {
    const localFontSize = localStorage.getItem(FONT_SIZE_STORAGE_KEY);
    const localThemeMode = localStorage.getItem(READING_THEME_STORAGE_KEY);

    setPreferences({
      ...DEFAULT_PREFERENCES,
      fontSize: localFontSize === 'large' ? 'large' : 'small',
      themeMode: isThemeMode(localThemeMode) ? localThemeMode : 'system',
    });

    if (!isAuthenticated) {
      return;
    }

    fetchPreferences()
      .then((response) => {
        setPreferences(toReadingPreferences(response));
      })
      .catch(() => {
        // 로컬 설정을 그대로 보여준다.
      });
  }, [isAuthenticated]);

  const savePreferences = (nextPreferences: ReadingPreferences) => {
    setPreferences(nextPreferences);
    localStorage.setItem(FONT_SIZE_STORAGE_KEY, nextPreferences.fontSize);
    localStorage.setItem(READING_THEME_STORAGE_KEY, nextPreferences.themeMode);

    if (authMode !== 'authenticated') {
      return;
    }

    setStatus('saving');
    updatePreferences(toPreferenceRequest(nextPreferences))
      .catch(() => {
        // 읽기 화면의 기존 동작처럼 저장 실패는 화면 흐름을 막지 않는다.
      })
      .finally(() => {
        setStatus('idle');
      });
  };

  return (
    <div className="min-h-screen bg-[#F0EEE7] px-5 pb-[132px] pt-9">
      <div className="mx-auto max-w-sm">
        <MyPageHeader title="설정" showBack />

        <section className="mb-6">
          <h2 className="mb-3 px-1 text-[13px] font-bold text-[#8D8881]">읽기 설정</h2>
          <div className="rounded-[16px] bg-white px-4 py-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <SettingLabel icon={Type} title="글자 크기" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <ChoiceButton
                label="보통"
                selected={preferences.fontSize === 'small'}
                onClick={() => savePreferences({ ...preferences, fontSize: 'small' })}
              />
              <ChoiceButton
                label="크게"
                selected={preferences.fontSize === 'large'}
                onClick={() => savePreferences({ ...preferences, fontSize: 'large' })}
              />
            </div>

            <div className="my-5 border-t border-[#F0EEE7]" />

            <SettingLabel icon={SunMedium} title="화면 테마" />
            <div className="mt-3 grid grid-cols-3 gap-2">
              <ChoiceButton
                label="시스템"
                selected={preferences.themeMode === 'system'}
                onClick={() => savePreferences({ ...preferences, themeMode: 'system' })}
              />
              <ChoiceButton
                label="밝게"
                selected={preferences.themeMode === 'light'}
                onClick={() => savePreferences({ ...preferences, themeMode: 'light' })}
              />
              <ChoiceButton
                label="어둡게"
                selected={preferences.themeMode === 'dark'}
                onClick={() => savePreferences({ ...preferences, themeMode: 'dark' })}
              />
            </div>

            <div className="my-5 border-t border-[#F0EEE7]" />

            <button
              type="button"
              onClick={() =>
                savePreferences({
                  ...preferences,
                  showVerseNumbers: !preferences.showVerseNumbers,
                })
              }
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <SettingLabel icon={Moon} title="절 번호 표시" />
              <span
                className={`flex h-7 w-12 items-center rounded-full p-1 transition ${
                  preferences.showVerseNumbers ? 'bg-[#414141]' : 'bg-[#D2CFC8]'
                }`}
              >
                <span
                  className={`h-5 w-5 rounded-full bg-white transition ${
                    preferences.showVerseNumbers ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </span>
            </button>

            {status === 'saving' && (
              <p className="mt-4 text-[12px] font-semibold text-[#8D8881]">설정을 저장하는 중...</p>
            )}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="mb-3 px-1 text-[13px] font-bold text-[#8D8881]">알림</h2>
          <div className="rounded-[16px] bg-white px-4 py-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <button
              type="button"
              onClick={todayVerseNotification.toggle}
              disabled={
                todayVerseNotification.permission === 'unsupported' ||
                todayVerseNotification.status === 'saving'
              }
              className="flex w-full items-center justify-between gap-4 text-left disabled:opacity-60"
            >
              <span>
                <SettingLabel icon={Bell} title="오늘의 말씀 알림" />
                <span className="mt-2 block break-keep text-[13px] font-semibold leading-relaxed text-[#8D8881]">
                  매일 오전 7~8시 사이에 오늘의 말씀을 받을 수 있어요.
                </span>
              </span>
              <span
                className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition ${
                  todayVerseNotification.isEnabled ? 'bg-[#414141]' : 'bg-[#D2CFC8]'
                }`}
              >
                <span
                  className={`h-5 w-5 rounded-full bg-white transition ${
                    todayVerseNotification.isEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </span>
            </button>
            <p className="mt-4 break-keep text-[12px] font-semibold leading-relaxed text-[#8D8881]">
              {getTodayVerseNotificationStatusMessage(
                todayVerseNotification.permission,
                todayVerseNotification.isEnabled,
                todayVerseNotification.status,
              )}
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 px-1 text-[13px] font-bold text-[#8D8881]">계정</h2>
          <div className="overflow-hidden rounded-[16px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            {isAuthenticated ? (
              <MyRow
                icon={LogOut}
                title="로그아웃"
                tone="danger"
                onClick={() => setIsLogoutSheetOpen(true)}
              />
            ) : (
              <MyRow icon={LogOut} title="로그인 후 계정 관리 가능" badge="게스트" disabled />
            )}
          </div>
        </section>
      </div>

      {isLogoutSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 px-4">
          <div className="w-full max-w-sm rounded-t-[28px] bg-[#F9F8F4] px-7 pb-8 pt-4 shadow-[0_-12px_32px_rgba(0,0,0,0.16)]">
            <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-[#D2CFC8]" />
            <h2 className="text-[20px] font-bold tracking-[-0.02em] text-[#414141]">
              정말 로그아웃 하시겠어요?
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-[#6E6A63]">
              다시 로그인하면 저장한 말씀을 그대로 다시 볼 수 있어요.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsLogoutSheetOpen(false)}
                className="h-14 rounded-[14px] bg-[#ECEAE3] text-[15px] font-bold text-[#414141]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  setIsLogoutSheetOpen(false);
                  router.push('/my');
                }}
                className="h-14 rounded-[14px] bg-[#B05F52] text-[15px] font-bold text-white"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark';
}

function SettingLabel({ icon: Icon, title }: { icon: typeof Type; title: string }) {
  return (
    <span className="flex items-center gap-2 text-[15px] font-bold text-[#414141]">
      <Icon size={18} className="text-[#8D8881]" />
      {title}
    </span>
  );
}

function ChoiceButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 rounded-full text-[13px] font-bold transition ${
        selected
          ? 'bg-[#414141] text-white'
          : 'bg-[#F0EEE7] text-[#6E6A63]'
      }`}
    >
      {label}
    </button>
  );
}
