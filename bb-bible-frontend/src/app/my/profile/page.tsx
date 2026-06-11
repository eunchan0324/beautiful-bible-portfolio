'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MyAvatar from '@/components/my/MyAvatar';
import MyPageHeader from '@/components/my/MyPageHeader';
import { getDisplayNickname, getUserEmail } from '@/components/my/my-page-utils';
import { useAuth } from '@/hooks/use-auth';
import { useUserMe } from '@/hooks/use-user-me';
import { updateUserMe } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { userMe } = useUserMe(isAuthenticated);
  const [nickname, setNickname] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState<string | null>(null);
  const displayNickname = getDisplayNickname(user, userMe);
  const email = getUserEmail(user, userMe);

  useEffect(() => {
    setNickname(displayNickname === '방문자' ? '' : displayNickname);
  }, [displayNickname]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextNickname = nickname.trim();
    if (nextNickname.length < 2) {
      setError('닉네임은 두 글자 이상 입력해주세요.');
      return;
    }

    setStatus('saving');
    setError(null);

    try {
      await updateUserMe({ nickname: nextNickname });
      setStatus('saved');
      window.setTimeout(() => router.push('/my'), 500);
    } catch (saveError) {
      setStatus('idle');
      setError(getApiErrorMessage(saveError, '프로필을 저장하지 못했어요.'));
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EEE7] px-5 pb-[132px] pt-9">
      <div className="mx-auto max-w-sm">
        <MyPageHeader title="프로필" showBack />

        <section className="rounded-[16px] bg-white px-5 py-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col items-center">
            <MyAvatar user={user} userMe={userMe} size="lg" />
            <p className="mt-4 text-[18px] font-bold text-[#414141]">{displayNickname}</p>
            <p className="mt-1 max-w-full truncate text-[13px] font-medium text-[#8D8881]">
              {email || 'Beautiful Bible 계정'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7">
            <label htmlFor="nickname" className="text-[13px] font-bold text-[#6E6A63]">
              닉네임
            </label>
            <input
              id="nickname"
              value={nickname}
              onChange={(event) => {
                setNickname(event.target.value);
                setStatus('idle');
                setError(null);
              }}
              className="mt-2 h-12 w-full rounded-[12px] border border-[#D2CFC8] bg-[#F9F8F4] px-4 text-[15px] font-semibold text-[#414141] outline-none focus:border-[#8D8881]"
              maxLength={20}
              placeholder="닉네임을 입력해주세요"
            />
            {error && <p className="mt-2 text-[12px] font-semibold text-[#B5564A]">{error}</p>}
            {status === 'saved' && (
              <p className="mt-2 text-[12px] font-semibold text-[#587C4B]">프로필을 저장했어요.</p>
            )}

            <button
              type="submit"
              disabled={status === 'saving' || !isAuthenticated}
              className="mt-6 h-12 w-full rounded-full bg-[#414141] text-[15px] font-bold text-white disabled:bg-[#C2BFB8]"
            >
              {status === 'saving' ? '저장 중...' : '저장하기'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
