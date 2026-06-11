package com.bb.bible.domain.push.service;

import com.bb.bible.domain.push.config.WebPushProperties;
import com.bb.bible.domain.push.entity.PushSubscription;
import com.bb.bible.domain.push.repository.PushSubscriptionRepository;
import com.bb.bible.domain.votd.dto.TodayVerseResponse;
import com.bb.bible.domain.votd.service.TodayVerseService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Encoding;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.apache.http.HttpResponse;
import org.apache.http.util.EntityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TodayVersePushService {

    private final WebPushProperties webPushProperties;
    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final TodayVerseService todayVerseService;
    private final ObjectMapper objectMapper;

    @Transactional
    public int sendTodayVerseToAllSubscribers() {
        if (!webPushProperties.isConfigured()) {
            log.warn("Web push is not configured.");
            return 0;
        }

        TodayVerseResponse todayVerse = todayVerseService.getTodayVerse();
        String payload = createPayload(todayVerse);
        PushService pushService = createPushService();

        List<PushSubscription> subscriptions = pushSubscriptionRepository.findAllByEnabledTrue();

        int successCount = 0;

        for (PushSubscription subscription : subscriptions) {
            if (sendNotification(pushService, subscription, payload)) {
                successCount++;
            }
        }

        return successCount;
    }

    private boolean sendNotification(
        PushService pushService,
        PushSubscription subscription,
        String payload
    ) {
        try {
            Notification notification = new Notification(
                toWebPushSubscription(subscription),
                payload
            );

            HttpResponse response = pushService.send(notification, Encoding.AES128GCM);
            int statusCode = response.getStatusLine().getStatusCode();

            if (statusCode >= 200 && statusCode < 300) {
                return true;
            }

            String reasonPhrase = response.getStatusLine().getReasonPhrase();
            String responseBody = readResponseBody(response);

            if (statusCode == 404 || statusCode == 410) {
                subscription.disable();
                log.info(
                    "Disabled expired push subscription. id={}, statusCode={}, reason={}, body={}",
                    subscription.getId(),
                    statusCode,
                    reasonPhrase,
                    responseBody
                );
                return false;
            }

            log.warn(
                "Failed to send push notification. id={}, statusCode={}, reason={}, body={}",
                subscription.getId(),
                statusCode,
                reasonPhrase,
                responseBody
            );
            return false;
        } catch (Exception e) {
            log.warn("Failed to send push notification. id={}", subscription.getId(), e);
            return false;
        }
    }

    private String readResponseBody(HttpResponse response) {
        if (response.getEntity() == null) {
            return "";
        }

        try {
            return EntityUtils.toString(response.getEntity());
        } catch (IOException e) {
            return "<failed to read response body>";
        }
    }

    private PushService createPushService() {
        try {
            return new PushService(
                webPushProperties.publicKey(),
                webPushProperties.privateKey(),
                webPushProperties.subject()
            );
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Invalid web push VAPID keys.", e);
        }
    }

    private Subscription toWebPushSubscription(PushSubscription subscription) {
        return new Subscription(
            subscription.getEndpoint(),
            new Subscription.Keys(subscription.getP256dh(), subscription.getAuth())
        );
    }

    private String createPayload(TodayVerseResponse todayVerse) {
        try {
            TodayVersePushPayload payload = new TodayVersePushPayload(
                "오늘의 말씀",
                formatNotificationBody(todayVerse),
                formatReference(todayVerse),
                todayVerse.verseKey(),
                buildVerseUrl(todayVerse)
            );

            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to create today verse push payload.", e);
        }
    }

    private String buildVerseUrl(TodayVerseResponse todayVerse) {
        return "/bible/%s/%d?startVerse=%d".formatted(
            todayVerse.bookCode(),
            todayVerse.chapterNum(),
            todayVerse.verseNum()
        );
    }

    private String formatReference(TodayVerseResponse todayVerse) {
        return "%s%d:%d".formatted(
            todayVerse.bookCode(),
            todayVerse.chapterNum(),
            todayVerse.verseNum()
        );
    }

    private String formatNotificationBody(TodayVerseResponse todayVerse) {
        return "[%s] %s".formatted(
            formatReference(todayVerse),
            todayVerse.verseText()
        );
    }

    private record TodayVersePushPayload(
        String title,
        String body,
        String reference,
        String verseKey,
        String url
    ) {
    }
}
