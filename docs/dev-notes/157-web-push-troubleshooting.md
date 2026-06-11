# #157 Web Push 트러블슈팅 기록

## 배경

Phase 9에서 오늘의 말씀 알림을 구현한 뒤, 실제 배포 환경에서 Web Push가 한 번에 동작하지 않았다.
프론트엔드 토글 UI, Service Worker, Supabase 구독 저장, Render 백엔드 발송, VAPID 키, 암호화 Provider, Chrome/Apple Push 서버까지 여러 계층이 연결된 기능이었기 때문이다.

이번 기록은 단순 구현 내용보다, 운영 환경에서 발생한 문제를 단계적으로 좁혀간 과정을 남기기 위한 dev-note다.

## 최종 결과

- iPhone PWA에서 오늘의 말씀 알림 수신 성공
- Chrome 브라우저에서 오늘의 말씀 알림 수신 성공
- Swagger 테스트 API 응답 `sentCount: 1` 확인
- Render 백엔드 500 에러 해결
- Chrome/FCM 403 발송 실패 해결

## 트러블슈팅 흐름

### 1. Service Worker가 등록되지 않음

처음에는 `/sw.js` 파일은 배포되어 있었지만, Chrome DevTools에서 `navigator.serviceWorker.getRegistrations()` 결과가 빈 배열이었다.
즉 알림 권한이나 구독 이전에 Service Worker 자체가 브라우저에 등록되지 않은 상태였다.

해결:

- `ServiceWorkerRegister` 컴포넌트를 추가해 프로덕션에서 `/sw.js`를 명시 등록했다.
- 등록 후 DevTools Application 탭에서 Service Worker가 잡히는 것을 확인했다.

### 2. Workbox precache 404로 Service Worker가 redundant 상태가 됨

Service Worker 등록 후에는 다음 문제가 발생했다.

```text
bad-precaching-response
/_next/app-build-manifest.json status: 404
```

`next-pwa`가 존재하지 않는 Next App Router manifest를 precache하려고 하면서 Service Worker install이 실패했고, 결과적으로 `redundant` 상태가 되었다.

해결:

- `next.config.ts`에 `buildExcludes: [/app-build-manifest\.json$/]`를 추가했다.
- 새 `sw.js`에서 `app-build-manifest` 항목이 사라진 것을 확인했다.
- DevTools에서 Service Worker가 `activated and is running` 상태가 되는 것을 확인했다.

### 3. 500 에러 원인이 Render 로그에 남지 않음

Swagger에서 오늘의 말씀 푸시 테스트 API를 호출하면 500이 발생했지만, Render 로그에는 실제 stack trace가 보이지 않았다.

원인:

- `GlobalExceptionHandler`가 `Exception.class`를 잡아 500 응답으로 변환하면서 예외 로그를 남기지 않았다.

해결:

- `log.error("Unhandled exception occurred.", e)`를 추가했다.
- 이후 Render 로그에서 실제 예외 원인을 추적할 수 있게 되었다.

### 4. Bouncy Castle 클래스 누락

로그를 남기자 첫 번째 실제 원인이 확인됐다.

```text
NoClassDefFoundError: org/bouncycastle/jce/spec/ECParameterSpec
```

원인:

- `nl.martijndwars:web-push` 라이브러리가 VAPID 키 처리에 Bouncy Castle 클래스를 사용하지만, 백엔드 runtimeClasspath에 `bcprov`가 없었다.

해결:

- `org.bouncycastle:bcprov-jdk18on:1.84` 의존성을 추가했다.
- `dependencyInsight`로 runtimeClasspath 포함을 확인했다.
- `compileJava` 성공을 확인했다.

### 5. Bouncy Castle Provider 미등록

의존성을 추가한 뒤에도 다음 예외가 발생했다.

```text
IllegalStateException: Invalid web push VAPID keys.
```

처음에는 VAPID 키 값 문제로 보였지만, `web-push` 라이브러리 내부 소스를 확인하니 다음처럼 `BC` provider를 이름으로 직접 조회하고 있었다.

```java
KeyFactory.getInstance("ECDH", "BC")
```

원인:

- `bcprov` jar가 classpath에 있어도 JVM Security Provider로 자동 등록되지 않으면 `BC` provider를 찾지 못한다.

해결:

- Spring Boot 시작 시 `Security.addProvider(new BouncyCastleProvider())`를 1회 실행하는 설정을 추가했다.
- 이미 등록되어 있으면 중복 등록하지 않도록 처리했다.

### 6. VAPID 키 변경 후 기존 구독 row가 남아 테스트가 꼬임

VAPID 키를 새로 만들고 Vercel/Render에 반영했지만, Supabase에는 이전 키로 만들어진 push subscription row가 남아 있었다.

Web Push 구독은 생성 시점의 public key와 연결되므로, VAPID 키를 바꾸면 기존 구독은 폐기하는 것이 안전하다.

해결:

- 테스트 중에는 `push_subscriptions` 테이블을 비우고 새로 구독을 만들었다.

```sql
delete from push_subscriptions;
```

- Chrome과 iPhone을 각각 따로 구독해 원인을 분리했다.

### 7. Chrome/FCM만 403으로 실패

iPhone PWA에서는 알림이 실제로 도착했지만, Chrome/FCM 구독은 계속 403으로 실패했다.

```text
Failed to send push notification. id=6, statusCode=403
```

원인 후보:

- 기존 `pushService.send(notification)` 기본 경로가 구형 `AESGCM` 인코딩을 사용했다.
- `web-push` 라이브러리 내부 구현상 FCM endpoint(`/fcm/send`)를 Web Push endpoint(`/wp`)로 바꾸는 처리는 `AES128GCM` 경로에서 수행된다.

해결:

- 발송 시 `Encoding.AES128GCM`을 명시했다.
- 실패 응답의 `statusCode`, `reason`, `body`를 로그로 남기도록 개선했다.
- 이후 Chrome에서 `sentCount: 1`과 실제 브라우저 알림 수신을 확인했다.

## 최종 검증

검증 순서:

```text
1. Supabase push_subscriptions 전체 삭제
2. Chrome에서 Service Worker unregister
3. Chrome Application Storage clear
4. 배포 사이트 새로고침 및 로그인
5. 오늘의 말씀 알림 ON
6. Supabase에 새 FCM row 생성 확인
7. Render Swagger에서 POST /api/v1/push/today-verse/test 실행
8. sentCount: 1 확인
9. Chrome 알림 수신 확인
10. iPhone PWA 알림 수신도 별도 확인
```

최종적으로 Chrome과 iPhone PWA 모두에서 알림 수신을 확인했다.

## 배운 점

- Web Push는 단순히 알림 권한을 받는 기능이 아니라, Service Worker, Push Subscription, VAPID, 백엔드 발송, 브라우저별 Push 서버가 모두 맞아야 동작한다.
- 운영 환경에서는 500 응답만으로는 원인을 알 수 없으므로, 공통 예외 처리에서 stack trace를 반드시 남겨야 한다.
- 라이브러리 의존성은 jar 추가만으로 충분하지 않을 수 있다. 암호화 Provider처럼 JVM에 명시 등록해야 하는 경우가 있다.
- VAPID 키를 바꾸면 기존 push subscription은 신뢰하기 어렵다. 테스트와 운영 모두에서 구독 재생성 전략이 필요하다.
- Chrome과 iOS는 endpoint와 Push 서버가 다르므로, 한쪽 성공이 다른 쪽 성공을 보장하지 않는다.
- 실패 로그는 status code만 남기면 부족하다. 외부 API 연동에서는 response body까지 남겨야 다음 원인을 빠르게 찾을 수 있다.

## 포트폴리오 포인트

- PWA Web Push를 프론트엔드 권한 UI부터 백엔드 발송 API까지 end-to-end로 구현했다.
- Service Worker 등록, Workbox precache, VAPID 키, Bouncy Castle Provider, FCM/Apple Push 차이까지 실제 운영 이슈를 해결했다.
- 단순 구현보다 더 중요한 운영 디버깅 역량을 보여준다.
- 문제를 추측으로 고치지 않고, 로그 추가 → 원인 확인 → 최소 핫픽스 → 재검증 순서로 해결했다.
- Render/Vercel/Supabase를 사용하는 무료 티어 운영 환경에서도 실제 사용자 기기 알림까지 검증했다.

## 관련 작업

- #136 오늘의 말씀 Web Push 발송 구현
- #144 Service Worker 명시 등록
- #146 Service Worker precache 404 제외
- #148 500 예외 로그 기록 추가
- #150 Web Push Bouncy Castle 런타임 의존성 추가
- #152 Web Push Bouncy Castle Provider 등록
- #154 Web Push FCM 발송 응답 로깅 및 AES128GCM 적용
