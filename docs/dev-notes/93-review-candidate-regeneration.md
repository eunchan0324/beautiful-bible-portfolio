# 93. REVIEW 요약 후보 재생성 기준

## 배경

장별 요약 배치는 AI가 만든 문장을 바로 `chapter_summaries`에 넣지 않고, 먼저 `chapter_summary_candidates`에 저장한다. 이때 AI 검수 결과가 `PASS`인 후보는 승인 대상으로 볼 수 있지만, `REVIEW` 후보는 바로 버리기보다 왜 걸렸는지 보고 처리 방식을 나누는 편이 좋다.

이번 기준은 관리자 API나 화면을 만들기 전, Supabase SQL Editor만으로 운영할 수 있는 최소 루틴이다.

## REVIEW 후보 조회

먼저 아직 운영자가 처리하지 않은 REVIEW 후보를 확인한다.

```sql
SELECT
  id,
  book_code,
  chapter_num,
  summary,
  generation_model,
  review_decision,
  review_reason,
  review_model,
  status,
  created_at
FROM chapter_summary_candidates
WHERE review_decision = 'REVIEW'
  AND status = 'PENDING'
ORDER BY book_code, chapter_num;
```

`review_reason`은 AI 검수 또는 코드 검증이 남긴 짧은 이유다. 지금 단계에서는 이 값을 완벽한 판정으로 보지 않고, 사람이 빠르게 우선순위를 나누는 힌트로 사용한다.

## 처리 기준

### 1. 사람이 보기에도 괜찮은 경우

AI가 `나열식 표현`이라고 판단했더라도 실제 앱 카드에서 자연스럽게 읽히는 경우가 있다. 이때는 후보를 억지로 재생성하지 않고 최종 요약으로 반영해도 된다.

```sql
INSERT INTO chapter_summaries (
  book_code,
  chapter_num,
  summary,
  model,
  created_at
)
SELECT
  c.book_code,
  c.chapter_num,
  c.summary,
  c.generation_model,
  NOW()
FROM chapter_summary_candidates c
WHERE c.id = :candidate_id
  AND NOT EXISTS (
    SELECT 1
    FROM chapter_summaries s
    WHERE s.book_code = c.book_code
      AND s.chapter_num = c.chapter_num
  );

UPDATE chapter_summary_candidates
SET status = 'APPROVED'
WHERE id = :candidate_id;
```

`:candidate_id`에는 승인할 후보의 `id`를 넣는다. 이 방식은 REVIEW 중에서도 사람이 직접 확인한 후보만 수동 승인하는 흐름이다.

### 2. 다시 생성하는 경우

문장이 너무 길거나, 사건을 단순히 이어 붙였거나, 종결이 어색하면 재생성 대상이다. 현재 후보 테이블에는 `(book_code, chapter_num)` 유니크 제약이 있으므로 같은 장을 다시 만들려면 기존 후보를 먼저 삭제해야 한다.

```sql
DELETE FROM chapter_summary_candidates
WHERE id = :candidate_id
  AND status = 'PENDING';
```

삭제 후 배치를 다시 실행하면 같은 장이 다시 후보로 생성된다. 무료 티어에서는 재시도보다 삭제 후 다음 실행에서 다시 생성하는 편이 요청 수를 예측하기 쉽다.

### 3. 당장 쓰지 않는 경우

계시록, 다니엘, 예언서처럼 신학적 표현이 민감하거나 사람이 더 확인하고 싶은 장은 `REJECTED`로 표시해 보류할 수 있다. 이 상태는 "나쁜 문장이라 폐기"라기보다 "이번 공개 범위에서는 사용하지 않음"에 가깝다.

```sql
UPDATE chapter_summary_candidates
SET status = 'REJECTED'
WHERE id = :candidate_id
  AND status = 'PENDING';
```

## 재생성 대상 찾기

현재는 `review_reason`이 짧은 문자열이므로, 운영자가 자주 보는 실패 이유를 기준으로 후보를 좁힌다.

```sql
SELECT
  id,
  book_code,
  chapter_num,
  summary,
  review_reason,
  created_at
FROM chapter_summary_candidates
WHERE review_decision = 'REVIEW'
  AND status = 'PENDING'
  AND (
    review_reason LIKE '%length%'
    OR review_reason LIKE '%ending%'
    OR review_reason LIKE '%나열%'
  )
ORDER BY created_at DESC;
```

이 쿼리로 나온 후보를 모두 자동 삭제하지는 않는다. 특히 `나열식 표현`은 AI 검수가 보수적으로 잡을 수 있으므로, 사람이 읽고 "앱 카드로 괜찮은지"를 한 번 보는 편이 안전하다.

## 추천 운영 루틴

1. 소규모 배치로 후보를 만든다.
2. `PASS + PENDING` 후보를 먼저 최종 테이블에 반영한다.
3. 남은 `REVIEW + PENDING` 후보를 조회한다.
4. 사람이 보기에 괜찮은 REVIEW는 수동 승인한다.
5. 어색한 REVIEW는 삭제 후 다음 배치에서 재생성한다.
6. 민감하거나 확신이 없는 장은 `REJECTED`로 보류한다.

## 판단 기준

좋은 요약은 성경 본문을 해석해 설교하지 않고, 해당 장의 흐름을 자연스러운 한 문장으로 안내한다.

- 좋음: 장의 주요 흐름이 한 문장 안에서 자연스럽게 이어진다.
- 보류: 의미는 맞지만 사건을 쉼표로 길게 이어 붙인 느낌이 강하다.
- 재생성: 종결어미가 어색하거나, 본문 밖 해석을 추가하거나, 앱 카드에서 읽기 어렵다.

## 정리

REVIEW 후보는 실패가 아니라 품질 게이트에 걸린 중간 산출물이다. 지금 단계에서는 자동으로 모두 버리기보다, 사람이 수동 승인할 후보와 재생성할 후보를 나누는 방식이 비용과 품질 사이에서 가장 현실적이다. 이 흐름이 안정되면 나중에 관리자 화면이나 승인 API로 확장할 수 있다.
