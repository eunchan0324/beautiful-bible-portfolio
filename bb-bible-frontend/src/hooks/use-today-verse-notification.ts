'use client';

import { useEffect, useState } from 'react';
import {
  deletePushSubscription,
  savePushSubscription,
  type PushSubscriptionRequest,
} from '@/lib/api';

export type TodayVerseNotificationPermission = NotificationPermission | 'unsupported';
export type TodayVerseNotificationStatus = 'idle' | 'saving' | 'error';

const TODAY_VERSE_NOTIFICATION_STORAGE_KEY = 'bb-today-verse-notification-enabled';
const WEB_PUSH_PUBLIC_KEY = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY;
const SERVICE_WORKER_READY_TIMEOUT_MS = 8000;

export function useTodayVerseNotification() {
  const [permission, setPermission] =
    useState<TodayVerseNotificationPermission>('unsupported');
  const [status, setStatus] = useState<TodayVerseNotificationStatus>('idle');
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (!isPushSubscriptionSupported()) {
      setPermission('unsupported');
      setIsEnabled(false);
      return;
    }

    setPermission(Notification.permission);

    if (Notification.permission !== 'granted') {
      setIsEnabled(false);
      return;
    }

    let isMounted = true;

    getReadyServiceWorkerRegistration()
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        if (!isMounted) {
          return;
        }

        setIsEnabled(
          localStorage.getItem(TODAY_VERSE_NOTIFICATION_STORAGE_KEY) === 'true' &&
            Boolean(subscription),
        );
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setIsEnabled(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const toggle = async () => {
    if (!isPushSubscriptionSupported()) {
      setPermission('unsupported');
      setIsEnabled(false);
      return;
    }

    if (!WEB_PUSH_PUBLIC_KEY) {
      setStatus('error');
      setIsEnabled(false);
      return;
    }

    setStatus('saving');

    try {
      if (isEnabled) {
        await unsubscribeTodayVerseNotification();
        localStorage.setItem(TODAY_VERSE_NOTIFICATION_STORAGE_KEY, 'false');
        setIsEnabled(false);
        setStatus('idle');
        return;
      }

      const nextPermission =
        Notification.permission === 'default'
          ? await Notification.requestPermission()
          : Notification.permission;

      setPermission(nextPermission);

      if (nextPermission !== 'granted') {
        localStorage.setItem(TODAY_VERSE_NOTIFICATION_STORAGE_KEY, 'false');
        setIsEnabled(false);
        setStatus('idle');
        return;
      }

      await subscribeTodayVerseNotification();
      localStorage.setItem(TODAY_VERSE_NOTIFICATION_STORAGE_KEY, 'true');
      setIsEnabled(true);
      setStatus('idle');
    } catch (error) {
      console.error('Failed to update today verse notification subscription.', error);
      localStorage.setItem(TODAY_VERSE_NOTIFICATION_STORAGE_KEY, 'false');
      setIsEnabled(false);
      setStatus('error');
    }
  };

  return {
    permission,
    status,
    isEnabled,
    toggle,
  };
}

async function subscribeTodayVerseNotification() {
  if (!WEB_PUSH_PUBLIC_KEY) {
    throw new Error('NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY is missing.');
  }

  const registration = await getReadyServiceWorkerRegistration();
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(WEB_PUSH_PUBLIC_KEY),
    }));
  const request = toPushSubscriptionRequest(subscription);

  if (!request) {
    throw new Error('Push subscription keys are missing.');
  }

  await savePushSubscription(request);
}

async function unsubscribeTodayVerseNotification() {
  const registration = await getReadyServiceWorkerRegistration();
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    return;
  }

  const request = toPushSubscriptionRequest(subscription);

  if (request) {
    await deletePushSubscription(request);
  }

  await subscription.unsubscribe();
}

function toPushSubscriptionRequest(
  subscription: PushSubscription,
): PushSubscriptionRequest | null {
  const subscriptionJson = subscription.toJSON();
  const p256dh = subscriptionJson.keys?.p256dh;
  const auth = subscriptionJson.keys?.auth;

  if (!subscriptionJson.endpoint || !p256dh || !auth) {
    return null;
  }

  return {
    endpoint: subscriptionJson.endpoint,
    p256dh,
    auth,
  };
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`.replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);

  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

function getReadyServiceWorkerRegistration() {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) => {
      window.setTimeout(
        () => reject(new Error('Service worker is not ready.')),
        SERVICE_WORKER_READY_TIMEOUT_MS,
      );
    }),
  ]);
}

export function getTodayVerseNotificationStatusMessage(
  permission: TodayVerseNotificationPermission,
  isEnabled: boolean,
  status: TodayVerseNotificationStatus = 'idle',
) {
  if (permission === 'unsupported') {
    return '이 브라우저에서는 알림을 사용할 수 없어요.';
  }

  if (permission === 'denied') {
    return '브라우저 설정에서 알림을 다시 허용해주세요.';
  }

  if (status === 'saving') {
    return '알림 설정을 저장하는 중이에요.';
  }

  if (status === 'error') {
    return '알림 설정을 저장하지 못했어요. 잠시 후 다시 시도해주세요.';
  }

  if (isEnabled) {
    return '매일 오전 7~8시 사이에 오늘의 말씀 알림을 받을 수 있어요.';
  }

  return '알림을 허용하면 오늘의 말씀을 매일 받을 수 있어요.';
}

export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function isPushSubscriptionSupported() {
  return (
    isNotificationSupported() &&
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}
