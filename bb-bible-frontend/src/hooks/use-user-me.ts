'use client';

import { useEffect, useState } from 'react';
import { UserMeResponse, fetchUserMe } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';

export function useUserMe(enabled: boolean) {
  const [userMe, setUserMe] = useState<UserMeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setUserMe(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetchUserMe()
      .then((data) => {
        if (isMounted) {
          setUserMe(data);
        }
      })
      .catch((fetchError) => {
        if (isMounted) {
          setError(getApiErrorMessage(fetchError, '사용자 정보를 불러오지 못했어요.'));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [enabled]);

  return {
    userMe,
    isLoading,
    error,
  };
}
