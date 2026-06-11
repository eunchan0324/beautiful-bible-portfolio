'use client';

import { useEffect, useState } from 'react';
import { Bookmark, ChevronRight, Clock3, LogIn, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SlowRequestNotice from '@/components/SlowRequestNotice';
import MyAvatar from '@/components/my/MyAvatar';
import MyPageHeader from '@/components/my/MyPageHeader';
import MyRow from '@/components/my/MyRow';
import { getDisplayNickname, getUserEmail } from '@/components/my/my-page-utils';
import { useAuth } from '@/hooks/use-auth';
import { useSlowRequest } from '@/hooks/use-slow-request';
import { useUserMe } from '@/hooks/use-user-me';
import { fetchSavedVerses } from '@/lib/api';

export default function MyPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, signInWithKakao } = useAuth();
  const { userMe } = useUserMe(isAuthenticated);
  const [savedVerseCount, setSavedVerseCount] = useState<number | null>(null);
  const [isSavedVerseCountLoading, setIsSavedVerseCountLoading] = useState(false);
  const isSlowSavedVerseCount = useSlowRequest(isSavedVerseCountLoading);
  const nickname = getDisplayNickname(user, userMe);
  const email = getUserEmail(user, userMe);

  useEffect(() => {
    if (!isAuthenticated) {
      setSavedVerseCount(null);
      setIsSavedVerseCountLoading(false);
      return;
    }

    let isMounted = true;
    setIsSavedVerseCountLoading(true);

    fetchSavedVerses()
      .then((items) => {
        if (isMounted) {
          setSavedVerseCount(items.length);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSavedVerseCount(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsSavedVerseCountLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-[#F0EEE7] px-5 pb-[132px] pt-9">
      <div className="mx-auto flex max-w-sm flex-col">
        <MyPageHeader
          title="마이페이지"
          rightAction={
            <button
              type="button"
              onClick={() => router.push('/my/settings')}
              aria-label="설정으로 이동"
              className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-[#414141] transition-colors hover:bg-white/70"
            >
              <Settings size={24} strokeWidth={2.2} />
            </button>
          }
        />

        {isLoading ? (
          <MyPageLoading />
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                if (isAuthenticated) {
                  router.push('/my/profile');
                }
              }}
              disabled={!isAuthenticated}
              className="mb-8 flex w-full items-center gap-4 rounded-[16px] bg-white px-5 py-5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] disabled:cursor-default"
            >
              <MyAvatar user={user} userMe={userMe} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[20px] font-bold tracking-[-0.02em] text-[#414141]">
                  {nickname}
                </span>
                <span className="mt-1 block truncate text-[13px] font-medium text-[#6E6A63]">
                  {isAuthenticated
                    ? email || 'Beautiful Bible 계정'
                    : '로그인하면 말씀을 저장할 수 있어요'}
                </span>
              </span>
              {isAuthenticated && <ChevronRight size={20} className="shrink-0 text-[#C2BFB8]" />}
            </button>

            {!isAuthenticated && (
              <section className="mb-6 rounded-[16px] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <p className="text-[15px] font-semibold text-[#414141]">내 말씀을 보관해보세요</p>
                <p className="mt-2 text-[13px] leading-relaxed text-[#6E6A63]">
                  로그인하면 저장한 말씀을 안전하게 보관하고 다시 찾아볼 수 있어요.
                </p>
                <button
                  type="button"
                  onClick={signInWithKakao}
                  className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#FEE500] text-[14px] font-bold text-[#191919]"
                >
                  <LogIn size={18} />
                  카카오로 로그인
                </button>
              </section>
            )}

            <section className="mb-6">
              <h2 className="mb-3 px-1 text-[13px] font-bold text-[#8D8881]">나의 말씀</h2>
              <div className="overflow-hidden rounded-[16px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <MyRow
                  icon={Bookmark}
                  title="저장한 말씀"
                  description={
                    isAuthenticated
                      ? savedVerseCount === null
                        ? '저장한 구절을 모아볼 수 있어요'
                        : `${savedVerseCount}개`
                      : '로그인 후 사용할 수 있어요'
                  }
                  href={isAuthenticated ? '/my/saved-verses' : undefined}
                  badge={!isAuthenticated ? '로그인 필요' : undefined}
                  disabled={!isAuthenticated}
                />
                <div className="mx-4 border-t border-[#F0EEE7]" />
                <MyRow icon={Clock3} title="최근 읽은 말씀" badge="곧 만나요" disabled />
              </div>
              {isSlowSavedVerseCount && <SlowRequestNotice className="mt-4" />}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function MyPageLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-[16px] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-[#E5E0D3]" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-5 w-24 animate-pulse rounded-full bg-[#E5E0D3]" />
          <div className="h-4 w-40 animate-pulse rounded-full bg-[#EDE9DF]" />
        </div>
      </div>
      <div className="h-[108px] animate-pulse rounded-[16px] bg-white/70" />
      <div className="h-[72px] animate-pulse rounded-[16px] bg-white/70" />
    </div>
  );
}
