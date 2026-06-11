import type { User } from '@supabase/supabase-js';
import type { UserMeResponse } from '@/lib/api';

export function getDisplayNickname(user: User | null, userMe?: UserMeResponse | null) {
  if (userMe?.nickname) {
    return userMe.nickname;
  }

  if (!user) {
    return '방문자';
  }

  return (
    user.user_metadata?.nickname ||
    user.user_metadata?.name ||
    user.user_metadata?.full_name ||
    '사용자'
  );
}

export function getUserAvatarUrl(user: User | null) {
  if (!user) {
    return null;
  }

  return user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
}

export function getUserEmail(user: User | null, userMe?: UserMeResponse | null) {
  return userMe?.email || user?.email || null;
}
