# #133 오늘의 말씀 후보 테이블 및 조회 API

## 배경

Phase 9의 PWA 오늘의 말씀 알림을 만들기 전에, 홈 화면과 알림이 함께 사용할 "오늘의 말씀" 소스가 필요했다.

성경 전체 31,089개 구절에서 매일 임의로 하나를 뽑으면 족보, 지명 나열, 문맥 의존 구절, 심판/전쟁 구절처럼 알림에 어울리지 않는 구절이 섞일 수 있다.
따라서 전체 랜덤 대신 큐레이션된 후보 목록에서 날짜 기준으로 하나를 선택하는 구조를 선택했다.

## 결정

- 오늘의 말씀 후보를 `today_verse_candidates` 테이블로 분리했다.
- 후보 테이블은 `verse_key`, `theme`, `sort_order`, `created_at`만 갖는 최소 구조로 시작했다.
- `review_status`, `tone`, `enabled`, `updated_at`은 이번 MVP에서 실제 운영 필요가 없어서 제외했다.
- `verse_key`는 JPA 관계가 아니라 문자열로 저장하고, DB에서는 `bible_verses(verse_key)`를 참조하는 FK를 둔다.
- 날짜 기준 선택은 `BASE_DATE`부터 오늘까지의 일수를 후보 수로 나눈 나머지로 계산한다.
- 후보 순서는 `sort_order`로 고정해, 같은 날짜에는 같은 후보가 선택되도록 했다.
- `/api/v1/today-verse`는 홈 화면에서 비로그인 사용자도 호출해야 하므로 공개 API로 열었다.

## 주요 흐름

```text
GET /api/v1/today-verse
→ today_verse_candidates를 sort_order ASC로 조회
→ daysSinceEpoch % candidateCount로 index 계산
→ candidates.get(index)로 오늘 후보 선택
→ verse_key로 bible_verses 조회
→ verseKey, bookCode, chapterNum, verseNum, verseText, theme 반환
```

## 테이블 구조

```sql
CREATE TABLE today_verse_candidates (
    id BIGSERIAL PRIMARY KEY,
    verse_key VARCHAR(30) NOT NULL,
    theme VARCHAR(50) NOT NULL,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
```

`verse_key`와 `sort_order`에는 각각 unique constraint를 둔다.

- `verse_key` unique: 같은 구절이 후보에 중복 등록되지 않게 한다.
- `sort_order` unique: 날짜 계산으로 선택할 후보 순서가 흔들리지 않게 한다.
- `verse_key` FK: 존재하지 않는 성경 구절 키가 후보에 들어가지 않게 한다.

## 트레이드오프

날짜별 확정 결과를 저장하는 `today_verse_daily` 테이블은 만들지 않았다.
현재는 같은 날짜에 같은 말씀이 나오기만 하면 충분하고, 104개 후보를 순환하는 방식이면 104일 동안 중복 없이 노출할 수 있기 때문이다.

수동 지정이나 절기별 말씀이 필요해지면 다음 구조를 추가할 수 있다.

```text
today_verse_daily
- date
- verse_key
- title
- message
```

또한 `enabled` 컬럼을 제외했기 때문에 특정 후보를 잠시 끄려면 현재는 seed SQL에서 제거하거나 DB에서 삭제해야 한다.
운영 중 피드백이 쌓이면 `enabled`를 추가하는 방향으로 확장할 수 있다.

## 검증

- Supabase에 `today_verse_candidates` 테이블 생성
- 후보 104개 seed 실행
- Swagger에서 `GET /api/v1/today-verse` 200 응답 확인
- SQL 후보 104개가 `bible.json`에 존재하는지 검증

## 포트폴리오 포인트

- 전체 랜덤 추천의 품질 리스크를 큐레이션 후보군으로 낮췄다.
- `verse_key`를 레이어 공통 키로 유지하면서 DB FK로 데이터 무결성을 보강했다.
- 날짜 기반 deterministic selection으로 별도 히스토리 테이블 없이도 매일 같은 결과를 보장했다.
- `sort_order`를 도입해 DB 조회 순서가 흔들려도 오늘의 말씀 선택이 안정적으로 유지되게 했다.
- MVP에서 필요 없는 상태 컬럼을 제거해 테이블을 작게 유지하고, 운영 필요가 생기면 확장하는 방향을 선택했다.
