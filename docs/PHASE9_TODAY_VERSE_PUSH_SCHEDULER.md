# Phase 9 Today Verse Push Scheduler

## Purpose

오늘의 말씀 Web Push는 백엔드 수동 발송 API로 Chrome과 iPhone PWA 수신까지 검증했다.
이 문서는 매일 오전 7시(KST)에 자동 발송하기 위해 필요한 운영 설정을 정리한다.

Render 무료 티어는 일정 시간 요청이 없으면 서버가 잠들 수 있다.
따라서 Spring `@Scheduled`만 사용하는 대신 GitHub Actions cron이 Render 백엔드 API를 호출하는 방식으로 구성한다.

## Backend Endpoint

```text
POST /api/v1/internal/push/today-verse
Header: X-Scheduler-Secret: <secret>
```

이 endpoint는 JWT 로그인을 사용하지 않는다.
대신 외부 스케줄러 전용 secret header로 보호한다.

Swagger 수동 테스트용 endpoint는 그대로 유지한다.

```text
POST /api/v1/push/today-verse/test
Authorization: Bearer <access-token>
```

## Render Environment

Render 백엔드에 다음 환경변수를 추가한다.

```text
PUSH_SCHEDULER_SECRET=<random-long-secret>
```

실제 운영에서는 직접 새로 만든 긴 랜덤 값을 사용한다.

Windows PowerShell에서는 다음 명령으로 랜덤 문자열을 만들 수 있다.

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

기존 Web Push 환경변수도 유지해야 한다.

```text
WEB_PUSH_PUBLIC_KEY=<vapid-public-key>
WEB_PUSH_PRIVATE_KEY=<vapid-private-key>
WEB_PUSH_SUBJECT=mailto:<email>
```

## GitHub Actions Secrets

Repository Settings > Secrets and variables > Actions에 다음 secret을 추가한다.

```text
BACKEND_BASE_URL=https://your-backend.onrender.com
PUSH_SCHEDULER_SECRET=<same-value-as-render>
```

`PUSH_SCHEDULER_SECRET`은 Render와 GitHub Actions에서 같은 값을 사용해야 한다.

## Schedule

GitHub Actions cron은 UTC 기준이다.
매일 오전 7시 KST는 전날 22:00 UTC이므로 workflow는 다음 cron을 사용한다.

```yaml
cron: '0 22 * * *'
```

## Verification

1. Render에 `PUSH_SCHEDULER_SECRET`을 추가하고 재배포한다.
2. GitHub Actions secrets에 `BACKEND_BASE_URL`, `PUSH_SCHEDULER_SECRET`을 추가한다.
3. GitHub Actions의 `Today Verse Push` workflow를 수동 실행한다.
4. Actions 로그에서 curl 요청이 성공하는지 확인한다.
5. Supabase `push_subscriptions`에 enabled row가 있는지 확인한다.
6. Chrome 또는 iPhone PWA에서 실제 알림 수신을 확인한다.

## Notes

- secret header가 없거나 틀리면 401로 거절된다.
- 구독 row가 없거나 발송 가능한 구독이 없으면 API는 200으로 응답하되 `sentCount`가 0일 수 있다.
- Render 무료 티어 cold start 때문에 Actions 실행 시간이 다소 길어질 수 있다.
