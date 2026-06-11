# 89. PASS 요약 후보 확정 반영

## 배경

`chapter_summary_candidates`는 AI가 만든 장별 요약 초안과 AI 검수 결과를 보관하는 작업 테이블이다. 실제 앱은 `chapter_summaries`만 조회하므로, 검수 결과가 `PASS`인 후보를 확정 테이블로 옮기는 승인 단계가 필요하다.

## 승인 SQL

Supabase SQL Editor에서 먼저 반영 대상을 확인한다.

```sql
SELECT
  id,
  book_code,
  chapter_num,
  summary,
  generation_model,
  review_decision,
  status
FROM chapter_summary_candidates
WHERE review_decision = 'PASS'
  AND status = 'PENDING'
ORDER BY id;
```

대상이 맞으면 아래 SQL로 확정 반영한다.

```sql
BEGIN;

WITH approved_candidates AS (
    SELECT
        id,
        book_code,
        chapter_num,
        summary,
        generation_model
    FROM chapter_summary_candidates
    WHERE review_decision = 'PASS'
      AND status = 'PENDING'
),
upserted AS (
    INSERT INTO chapter_summaries (
        book_code,
        chapter_num,
        summary,
        model
    )
    SELECT
        book_code,
        chapter_num,
        summary,
        generation_model
    FROM approved_candidates
    ON CONFLICT (book_code, chapter_num)
    DO UPDATE SET
        summary = EXCLUDED.summary,
        model = EXCLUDED.model
    RETURNING book_code, chapter_num
)
UPDATE chapter_summary_candidates c
SET status = 'APPROVED'
FROM upserted u
WHERE c.book_code = u.book_code
  AND c.chapter_num = u.chapter_num
  AND c.review_decision = 'PASS'
  AND c.status = 'PENDING';

COMMIT;
```

`ON CONFLICT`는 같은 `book_code`, `chapter_num` 요약이 이미 있으면 새 후보의 요약과 모델로 갱신한다. `RETURNING`은 실제로 insert/update된 장 목록을 다음 `UPDATE`에서 사용하기 위해 반환한다.

## 검증

창세기 PASS 후보를 확정 반영한 뒤 Swagger에서 기존 장별 요약 API를 확인했다.

```http
GET /api/v1/bible/books/창/chapters/6/summary
```

응답:

```json
{
  "bookCode": "창",
  "chapterNum": 6,
  "summary": "사람의 죄악이 세상에 가득하여 하나님이 심판을 계획하시고, 의인 노아에게 방주를 지어 구원받을 것을 명령하시는 과정을 전합니다.",
  "model": "gemini-2.5-flash"
}
```

이번 단계에서는 별도 관리자 API나 화면을 만들지 않고 SQL 기반 승인으로 범위를 제한했다. 이후 후보가 많아지면 승인 API나 관리자 화면으로 확장할 수 있다.
