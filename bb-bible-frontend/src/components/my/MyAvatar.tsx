import type { User } from '@supabase/supabase-js';
import { getDisplayNickname, getUserAvatarUrl } from '@/components/my/my-page-utils';
import type { UserMeResponse } from '@/lib/api';

interface MyAvatarProps {
  user: User | null;
  userMe?: UserMeResponse | null;
  size?: 'md' | 'lg';
}

export default function MyAvatar({ user, userMe, size = 'md' }: MyAvatarProps) {
  const nickname = getDisplayNickname(user, userMe);
  const avatarUrl = getUserAvatarUrl(user);
  const sizeClass = size === 'lg' ? 'h-20 w-20 text-2xl' : 'h-14 w-14 text-xl';

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E7DDC4] font-bold text-[#6B5A3A] ${sizeClass}`}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="프로필 이미지" className="h-full w-full object-cover" />
      ) : (
        <span>{nickname.slice(0, 1)}</span>
      )}
    </div>
  );
}
