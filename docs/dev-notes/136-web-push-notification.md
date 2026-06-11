# #136 오늘의 말씀 Web Push 알림 구현

## 배경

Phase 9의 목표는 사용자가 앱을 열지 않아도 매일 오늘의 말씀을 다시 떠올릴 수 있게 만드는 것이다.
단순히 프론트에서 알림 권한을 받는 것만으로는 충분하지 않았다.

브라우저 푸시는 다음 세 단계가 모두 연결되어야 실제로 동작한다.

```text
사용자 기기에서 알림 구독 생성
-> 백엔드에 구독 정보 저장
-> 백엔드가 저장된 구독으로 푸시 발송
-> service worker가 push 이벤트를 받아 알림 표시
```

이번 작업에서는 오늘의 말씀 API를 재사용해서, 저장된 구독자에게 오늘의 말씀 payload를 보내고 알림 클릭 시 해당 구절로 이동하는 흐름을 만들었다.

## 초보자용 흐름 정리

Web Push에서 헷갈렸던 부분은 "알림 권한"과 "푸시 구독"이 다르다는 점이다.

```text
Notification permission
= 브라우저가 이 앱의 알림 표시를 허용했는지

Push subscription
= 서버가 이 기기에 푸시를 보낼 수 있는 주소와 암호화 키
```

그래서 알림 버튼을 눌렀을 때 실제 흐름은 다음과 같다.

```text
1. 사용자가 오늘의 말씀 알림을 켠다.
2. 브라우저 Notification 권한을 요청한다.
3. service worker가 준비될 때까지 기다린다.
4. PushManager.subscribe()로 브라우저 구독을 만든다.
5. 구독에서 endpoint, p256dh, auth 값을 꺼낸다.
6. 프론트가 이 값을 백엔드 POST /api/v1/push-subscriptions 로 보낸다.
7. 백엔드는 user_id와 함께 DB에 저장한다.
```

여기서 `endpoint`는 푸시를 보낼 주소이고, `p256dh`와 `auth`는 알림 내용을 안전하게 암호화하기 위한 브라우저 키 재료다.
endpoint만 저장하면 발송할 수 없다.

발송할 때는 반대 방향으로 흐른다.

```text
1. 백엔드가 오늘의 말씀을 조회한다.
2. enabled=true 인 push_subscriptions 목록을 가져온다.
3. endpoint, p256dh, auth를 Web Push 라이브러리의 Subscription 객체로 바꾼다.
4. VAPID private key로 발송 주체를 서명한다.
5. 푸시 서비스로 payload를 보낸다.
6. 프론트 service worker가 push 이벤트를 받는다.
7. showNotification()으로 실제 알림을 띄운다.
8. 사용자가 알림을 누르면 오늘의 말씀 구절 페이지로 이동한다.
```

## VAPID 키 이해

VAPID 키는 Web Push에서 "이 서버가 이 앱의 알림을 보내는 서버가 맞다"는 것을 증명하기 위한 키다.

```text
Public Key
- 프론트에서 PushManager.subscribe()에 사용
- 브라우저에 노출되어도 되는 값
- Vercel: NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY
- Render: WEB_PUSH_PUBLIC_KEY

Private Key
- 백엔드가 발송할 때 서명에 사용
- 절대 프론트에 넣으면 안 되는 비밀값
- Render: WEB_PUSH_PRIVATE_KEY

Subject
- 푸시 발송 주체 연락처
- 사용자에게 보이는 값은 아님
- Render: WEB_PUSH_SUBJECT=mailto:...
```

Next.js의 `NEXT_PUBLIC_` 환경변수는 빌드 시점에 브라우저 코드에 포함된다.
따라서 Vercel에 public key를 추가한 뒤에는 프론트 재배포가 필요하다.

## 구현 내용

백엔드에는 구독 저장 API와 발송 서비스를 추가했다.

```text
PushSubscription
-> user, endpoint, p256dh, auth, enabled 저장

PushSubscriptionService
-> 구독 저장/재활성화
-> 구독 해제 시 hard delete 대신 enabled=false 처리

WebPushProperties
-> WEB_PUSH_PUBLIC_KEY / PRIVATE_KEY / SUBJECT 설정을 타입 안전하게 주입

TodayVersePushService
-> 오늘의 말씀 조회
-> enabled=true 구독 목록 조회
-> Web Push 발송
-> 404/410 응답이면 만료된 구독으로 보고 disable

TodayVersePushController
-> Swagger 수동 테스트용 POST /api/v1/push/today-verse/test 제공
```

프론트에는 구독 생성과 service worker 수신 처리를 추가했다.

```text
useTodayVerseNotification
-> Notification 권한 요청
-> service worker ready 대기
-> PushManager.subscribe()
-> endpoint/p256dh/auth 추출
-> 백엔드 구독 저장/해제 API 호출

worker/index.js
-> push 이벤트 수신
-> showNotification() 호출
-> notificationclick 시 구절 URL로 이동
```

`public/sw.js`와 `public/workbox-*.js`는 `next-pwa`가 빌드 때 생성하는 산출물이므로 직접 수정하지 않았다.
대신 `worker/index.js`를 추가해서 `next-pwa`가 빌드 시 custom worker를 생성된 service worker에 import하도록 했다.

## 설계 결정

- 구독은 사용자 단위가 아니라 기기 단위로 저장한다.
  같은 사용자가 휴대폰과 PC에서 알림을 켤 수 있기 때문이다.
- 구독 해제는 삭제 대신 `enabled=false`로 처리했다.
  사용자가 다시 켰을 때 기존 endpoint를 재활성화할 수 있고, 발송 실패 구독도 같은 방식으로 비활성화할 수 있다.
- 만료된 구독은 발송 응답이 `404` 또는 `410`일 때 disable한다.
  이미 사라진 브라우저 구독에 매일 계속 발송하지 않기 위해서다.
- 스케줄러보다 수동 테스트 API를 먼저 만들었다.
  Web Push는 환경변수, service worker, 브라우저 권한, DB 구독이 모두 맞아야 하므로 자동화 전에 Swagger로 직접 검증할 수 있는 지점이 필요했다.
- payload에는 title, body, reference, verseKey, url을 넣었다.
  알림 표시는 단순하게 유지하되, 클릭 시 정확한 구절로 이동할 수 있게 했다.

## 트레이드오프

아직 실제 매일 발송 스케줄러는 붙이지 않았다.
이번 단계는 "발송 가능한 파이프라인"을 먼저 만드는 것이 목적이다.

```text
현재
-> Swagger 수동 발송 API로 구독/발송/수신 전체 흐름 검증

다음 단계
-> 외부 스케줄러 또는 Spring Scheduler로 매일 오전 7시 발송
```

Render 무료 서버는 cold start가 있기 때문에 백엔드 자체 스케줄러만 믿으면 서버가 잠든 상태에서 발송이 안정적이지 않을 수 있다.
따라서 실제 운영 발송은 Render cron, GitHub Actions, cron-job.org 같은 외부 스케줄러가 백엔드 발송 API를 호출하는 방식도 검토할 가치가 있다.

## 검증

- VAPID key 생성
- Vercel에 `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY` 등록
- Render에 `WEB_PUSH_PUBLIC_KEY`, `WEB_PUSH_PRIVATE_KEY`, `WEB_PUSH_SUBJECT` 등록
- 프론트 `npm run build` 성공 확인
- 백엔드 `./gradlew.bat compileJava` 성공 확인
- 변경 파일 ESLint 및 TypeScript 체크 통과

## 포트폴리오 포인트

- PWA Web Push를 단순 권한 UI가 아니라 구독 저장, 서버 발송, service worker 수신까지 end-to-end로 연결했다.
- VAPID public/private key의 역할을 분리하고, Vercel/Render 환경변수 배치를 운영 관점에서 정리했다.
- 사용자별 데이터가 아니라 기기별 구독 모델을 설계해 실제 모바일/데스크톱 사용 상황을 반영했다.
- 만료된 push subscription을 `404/410` 응답 기준으로 비활성화해 운영 중 실패 요청이 누적되지 않도록 했다.
- 자동 스케줄러를 바로 붙이지 않고 수동 발송 API를 먼저 만들어, 복잡한 외부 연동을 단계적으로 검증할 수 있게 했다.
- 기존 오늘의 말씀 API를 재사용해 홈 화면, 알림 payload, 알림 클릭 이동이 같은 콘텐츠 기준을 공유하도록 만들었다.
