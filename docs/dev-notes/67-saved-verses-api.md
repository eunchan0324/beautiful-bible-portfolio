# #67 저장한 말씀 API 구현

## 배경

검색과 배포가 완료된 뒤, 로그인 사용자가 다시 보고 싶은 성경 구절을 서버에 저장할 수 있는 기능이 필요해졌다.
프론트 화면 명칭은 "저장한 말씀"으로 정하고, 백엔드 도메인 명칭은 의미가 직접 연결되는 `saved verse`로 정했다.

## 결정

- API는 `GET`, `POST`, `DELETE /api/v1/saved-verses`로 구성했다.
- 모든 저장한 말씀 API는 Supabase JWT 인증이 필요하다.
- 저장 테이블은 `saved_verses`를 사용한다.
- 저장 데이터는 사용자별로 분리하며, `UNIQUE(user_id, verse_key)`로 같은 사용자의 중복 저장을 DB에서 막는다.
- `verse_key`는 기존 프로젝트 규칙대로 `창1:1` 문자열 형식을 그대로 저장한다.
- `verse_key`를 `bible_verses`의 FK로 바꾸지 않고, 저장 전 `BibleVerseRepository.findByVerseKey()`로 존재 여부를 확인한다.
- 중복 저장 요청은 `409 CONFLICT`로 처리한다.
- 응답에는 화면 렌더링에 필요한 `bookCode`, `bookName`, `chapterNum`, `verseNum`, `verseText`, `createdAt`을 포함한다.

## DDL

Supabase SQL Editor에서 다음 DDL을 직접 적용했다.

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

## 트레이드오프

`verse_key`를 FK 조인으로 만들면 DB 정합성은 더 강해지지만, API가 받는 `창1:1` 값을 내부 id로 변환하는 흐름이 생긴다.
이 프로젝트는 프론트 localStorage, API 경로, 백엔드 DB 컬럼에서 같은 `verse_key` 형식을 유지하는 것이 중요한 규칙이므로 문자열 계약을 유지했다.

중복 저장은 멱등 처리도 가능하지만, 이번에는 이미 저장된 상태를 클라이언트가 명확히 알 수 있도록 `409 CONFLICT`를 선택했다.
덕분에 DB 유니크 제약과 전역 예외 처리 흐름을 함께 검증할 수 있었다.

## 검증

Swagger에서 Supabase access token을 사용해 다음 흐름을 확인했다.

- 토큰 없이 `GET /api/v1/saved-verses` 호출 시 401
- `POST /api/v1/saved-verses` 저장 성공
- 같은 `verseKey` 재저장 시 409
- `GET /api/v1/saved-verses`에서 저장한 말씀과 본문 정보 반환
- `DELETE /api/v1/saved-verses/{verseKey}` 후 목록에서 제거

## 포트폴리오 포인트

- 배포 이후 사용자별 저장 기능을 백엔드에 추가했다.
- `user_id + verse_key` 유니크 제약으로 사용자별 중복 저장을 DB 레벨에서 보장했다.
- 프로젝트 전체의 `verse_key` 문자열 계약을 유지하면서 성경 원문 데이터와 사용자 저장 데이터를 연결했다.
- 중복 요청에 `409 CONFLICT`를 반환해 API 상태 의미를 명확히 했다.
