# #53 PostgreSQL FTS 기반 검색 개선

## 배경

#49에서 성경 검색 API를 먼저 구현했고, #50에서 프론트 검색 화면과 책 바로가기 UX를 연결했다.
초기 검색은 `LIKE '%keyword%'` 기반이라 이해하기 쉽고 API 계약을 빠르게 검증하기 좋았다.
이후 검색 성능과 확장성을 개선하기 위해 PostgreSQL FTS를 적용한다.

## 결정

- `/api/v1/search` 응답 형식은 유지한다.
- 프론트 검색 화면은 수정하지 않고, 백엔드 내부 검색 방식만 교체한다.
- 한국어 형태소 분석은 이번 범위에서 다루지 않는다.
- PostgreSQL `simple` config 기반 FTS로 시작한다.
- `LIKE` fallback은 넣지 않고 FTS only로 간다.
- FTS 인덱스는 현재 마이그레이션 도구가 없으므로 Supabase SQL Editor에서 직접 생성한다.

## DB 작업

Supabase SQL Editor에서 다음 인덱스를 생성했다.

```sql
CREATE INDEX IF NOT EXISTS idx_bible_verses_verse_text_fts
ON bible_verses
USING gin (to_tsvector('simple', verse_text));
```

실행 결과:
- `Success. No rows returned`

## 구현 포인트

- `to_tsvector('simple', verse_text)`
- `plainto_tsquery('simple', :keyword)`
- GIN index
- Spring Data JPA native query
- 기존 `SearchService` / `SearchController` / 응답 DTO 유지

## 검증 메모

- `q=사랑&page=0&size=10` 호출 시 200 OK와 검색 결과를 확인했다.
- `q=여호와&page=0&size=10` 호출 시 200 OK와 검색 결과를 확인했다.
- `q=여호와 하나`처럼 단어를 추가하면 결과가 2개 수준으로 좁혀지는 것을 확인했다.
- 검색 UX는 많은 결과를 스크롤로 탐색하기보다, 사용자가 단어를 더해 좁혀가는 흐름을 의도한다.

## 한계와 후속 후보

- PostgreSQL `simple` FTS는 한국어 형태소 분석을 하지 않는다.
- `여호와께서`, `사랑하신`처럼 조사나 어미가 붙은 단어는 `LIKE '%keyword%'`보다 일부 결과가 줄어들 수 있다.
- 이번 범위에서는 FTS 구조와 인덱스 적용을 우선하고, 한국어 검색 품질 개선은 후속 과제로 남긴다.
- 후속 후보: 한국어 검색 품질 비교, `LIKE` fallback 검토, 형태소 분석 기반 검색 또는 의미 검색(pgvector) 검토.

## 포트폴리오 포인트

- 기능 우선 구현 후 성능 개선으로 이어지는 단계적 개발
- API 계약을 유지한 채 내부 DB 검색 구현 교체
- PostgreSQL FTS와 GIN index를 활용한 검색 성능 개선
- 한국어 검색의 한계를 인지하고, 복잡한 형태소 분석 대신 현재 단계에 맞는 `simple` config를 선택
- 검색 UX와 DB 검색 방식의 트레이드오프를 함께 판단
