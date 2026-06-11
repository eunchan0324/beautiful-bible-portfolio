'use client';

import { useEffect, useState } from 'react';
import { fetchHealth } from '@/lib/api';

export type BackendWarmupStatus = 'preparing' | 'slow' | 'ready' | 'unavailable';

const SLOW_REQUEST_MILLIS = 10_000;
const READY_VISIBLE_MILLIS = 2_400;

export function useBackendWarmup() {
  const [status, setStatus] = useState<BackendWarmupStatus>('preparing');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let isActive = true;

    const slowTimerId = window.setTimeout(() => {
      if (isActive) {
        setStatus('slow');
      }
    }, SLOW_REQUEST_MILLIS);
    let readyTimerId: number | undefined;

    fetchHealth()
      .then(() => {
        if (!isActive) {
          return;
        }

        window.clearTimeout(slowTimerId);
        setStatus('ready');

        readyTimerId = window.setTimeout(() => {
          if (isActive) {
            setIsVisible(false);
          }
        }, READY_VISIBLE_MILLIS);
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        window.clearTimeout(slowTimerId);
        setStatus('unavailable');
      });

    return () => {
      isActive = false;
      window.clearTimeout(slowTimerId);
      window.clearTimeout(readyTimerId);
    };
  }, []);

  return {
    status,
    isVisible,
  };
}
