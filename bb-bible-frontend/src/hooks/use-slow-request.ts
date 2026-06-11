'use client';

import { useEffect, useState } from 'react';

const DEFAULT_SLOW_REQUEST_MILLIS = 6_000;

export function useSlowRequest(
  isLoading: boolean,
  delayMillis = DEFAULT_SLOW_REQUEST_MILLIS,
) {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsSlow(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsSlow(true);
    }, delayMillis);

    return () => window.clearTimeout(timeoutId);
  }, [delayMillis, isLoading]);

  return isSlow;
}
