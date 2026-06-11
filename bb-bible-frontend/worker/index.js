const DEFAULT_NOTIFICATION_TITLE = '오늘의 말씀';
const DEFAULT_NOTIFICATION_BODY = '오늘의 말씀을 확인해보세요.';
const DEFAULT_NOTIFICATION_URL = '/';
const NOTIFICATION_ICON_URL = '/icons/BB-icon-192.png';
const NOTIFICATION_BADGE_URL = '/icons/BB-icon-72.png';

self.addEventListener('push', (event) => {
  const payload = parsePushPayload(event.data);
  const title = payload.title || DEFAULT_NOTIFICATION_TITLE;
  const body = payload.body || DEFAULT_NOTIFICATION_BODY;
  const url = toAbsoluteUrl(payload.url || DEFAULT_NOTIFICATION_URL);

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: NOTIFICATION_ICON_URL,
      badge: NOTIFICATION_BADGE_URL,
      data: {
        url,
        verseKey: payload.verseKey || null,
        reference: payload.reference || null,
      },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || toAbsoluteUrl(DEFAULT_NOTIFICATION_URL);

  event.waitUntil(openOrFocusWindow(targetUrl));
});

function parsePushPayload(data) {
  if (!data) {
    return {};
  }

  try {
    return data.json();
  } catch {
    return {
      body: data.text(),
    };
  }
}

function toAbsoluteUrl(path) {
  return new URL(path, self.location.origin).href;
}

async function openOrFocusWindow(targetUrl) {
  const windowClients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  });

  const matchingClient = windowClients.find((client) => client.url === targetUrl);

  if (matchingClient) {
    return matchingClient.focus();
  }

  return self.clients.openWindow(targetUrl);
}
