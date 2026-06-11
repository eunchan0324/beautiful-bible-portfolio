# Beautiful Bible - Backend Plan 2

> Phase 6 이후 백엔드 기능 확장 계획.
> Phase 1-5의 기초 로드맵은 [BACKEND_PLAN.md](BACKEND_PLAN.md)에 유지한다.

---

## 목적

Phase 1-5에서 성경 조회, 인증, 사용자 데이터, 검색, 배포 기반을 먼저 만들었다.

Plan 2는 배포 이후 실제 사용자 기능을 하나씩 확장하는 문서다. 기존 백엔드 구조를 크게 흔들지 않고, 학습자가 직접 설명할 수 있는 작은 단위로 기능을 추가한다.

---

## Phase 6: 저장한 말씀 API

### 사용자-facing 명칭

- 화면 명칭: **저장한 말씀**

### 개발/도메인 명칭

개발/도메인 명칭은 `saved verse`로 정한다.

이 기능은 단순한 위치 표시보다 "내가 다시 보고 싶은 말씀을 저장한다"는 의미가 강하다. 사용자 화면의 "저장한 말씀"과 의미 차이가 작으므로, API path와 패키지명도 `saved-verses`, `savedverse`를 사용한다.

---

## #67 저장한 말씀 API 설계

### 목표

로그인 사용자가 성경 구절을 저장하고, 저장한 구절 목록을 다시 조회하며, 필요하면 저장을 해제할 수 있게 한다.

이 기능은 사용자별 데이터이므로 모든 API는 인증된 사용자만 호출할 수 있어야 한다.

### 제외 범위

- 프론트 UI 연동
- 폴더/태그
- 메모
- 공유
- 추천 알고리즘
- 무한 스크롤/검색 고도화

---

## API

```
GET    /api/v1/saved-verses
POST   /api/v1/saved-verses
DELETE /api/v1/saved-verses/{verseKey}
```

### 인증

- 모든 엔드포인트는 Supabase JWT 인증 필요
- 컨트롤러에서는 현재 로그인 사용자의 `userId`를 기준으로 데이터 접근
- 다른 사용자의 저장 데이터를 조회하거나 삭제할 수 없어야 한다.

### `verse_key` 규칙

`verse_key`는 기존 규칙대로 어디서나 `창1:1` 형식을 유지한다.

프론트엔드 localStorage, 백엔드 DB 컬럼, API 경로 사이에서 별도 변환을 만들지 않는다.

---

## 응답 필드

저장한 말씀 목록은 단순히 `verseKey`만 반환하지 않고, 화면에서 바로 렌더링할 수 있도록 성경 구절 정보도 함께 반환한다.

```json
{
  "verseKey": "창1:1",
  "bookCode": "창",
  "bookName": "창세기",
  "chapterNum": 1,
  "verseNum": 1,
  "verseText": "샘플 구절 본문입니다",
  "createdAt": "2026-05-23T10:00:00"
}
```

---

## DB 설계

```sql
CREATE TABLE saved_verses (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    verse_key VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uk_saved_verses_user_verse UNIQUE (user_id, verse_key)
);

CREATE INDEX idx_saved_verses_user_id ON saved_verses(user_id);
CREATE INDEX idx_saved_verses_verse_key ON saved_verses(verse_key);
```

위 DDL은 Supabase SQL Editor에서 직접 적용했다.

### 왜 `UNIQUE(user_id, verse_key)`가 필요한가

중복 저장을 애플리케이션 코드에서만 막으면 동시에 같은 요청이 들어올 때 중복 데이터가 생길 수 있다.

DB 제약 조건으로 한 번 더 막아두면, 서비스 코드 실수나 동시 요청 상황에서도 "한 사용자는 같은 구절을 한 번만 저장한다"는 규칙이 보장된다.

---

## 중복 저장 정책

같은 사용자가 이미 저장한 구절을 다시 저장하면 `409 CONFLICT`를 반환한다.

### 이유

- 클라이언트가 "이미 저장된 상태"를 명확히 알 수 있다.
- 저장 요청이 실제로 새 데이터를 만들지 않았다는 점이 분명하다.
- 기존 전역 예외 처리에서 409 응답을 학습한 흐름과 연결된다.

대안으로 멱등 처리(`200 OK` 또는 `204 No Content`)도 가능하지만, 이번 학습 목표에서는 DB 유니크 제약과 비즈니스 예외를 함께 다루기 위해 `409 CONFLICT`를 선택했다.

---

## 구현 흐름

1. 기존 `highlight` 도메인의 사용자별 `verseKey` 저장 흐름을 확인한다.
2. 도메인 명칭을 `savedverse`로 확정한다.
3. Entity, Repository, DTO, Service, Controller를 작은 단위로 추가한다.
4. 중복 저장 시 `409 CONFLICT`가 나오는지 테스트한다.
5. Swagger에서 인증 토큰으로 `GET/POST/DELETE`를 검증한다.

---

## 단계별 검증

| 항목 | 검증 방법 | 상태 |
| ---- | --------- | ---- |
| 인증 필요 | 토큰 없이 호출 시 401 | Swagger 검증 완료 |
| 저장 성공 | `POST /api/v1/saved-verses` 후 저장 응답 확인 | Swagger 검증 완료 |
| 목록 조회 | `GET /api/v1/saved-verses`에서 저장한 구절 정보 반환 | Swagger 검증 완료 |
| 중복 방지 | 같은 사용자가 같은 `verseKey` 재저장 시 409 | Swagger 검증 완료 |
| 삭제 | `DELETE /api/v1/saved-verses/{verseKey}` 후 목록에서 제거 | Swagger 검증 완료 |

---

## 포트폴리오 기록

이번 작업은 다음 결정이 포트폴리오 기록으로 남길 만하다.

- `saved verse`를 도메인 명칭으로 선택한 이유
- `UNIQUE(user_id, verse_key)`로 사용자별 중복 저장을 DB에서 보장한 이유
- 중복 저장을 `409 CONFLICT`로 처리한 이유와 멱등 처리와의 트레이드오프

자세한 기록은 [dev-notes/67-saved-verses-api.md](dev-notes/67-saved-verses-api.md)에 남긴다.
