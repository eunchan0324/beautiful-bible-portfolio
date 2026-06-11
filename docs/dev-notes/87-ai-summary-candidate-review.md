# 87. AI 요약 후보 저장과 문장흐름 검수

## 배경

장별 요약을 바로 `chapter_summaries`에 저장하면 AI가 만든 어색한 문장이 곧바로 서비스 확정 데이터가 된다. 1,100개 이상의 장을 사람이 전부 검수하기도 어렵기 때문에, 생성과 확정을 분리하는 중간 단계가 필요했다.

## 결정

AI 생성 결과는 먼저 `chapter_summary_candidates`에 후보로 저장한다.

- `chapter_summaries`: 사용자가 실제로 보는 확정 요약
- `chapter_summary_candidates`: AI가 만든 초안과 AI 문장흐름 검수 결과

`review_decision`은 `PASS`, `REVIEW`, `REJECT` 중 하나다. 단, `PASS`도 자동 확정은 아니다. `PASS`는 사람이 검수할 우선순위가 낮다는 뜻이고, 최종 반영은 별도 승인 단계에서 처리한다.

## Supabase SQL

Supabase SQL Editor에서 아래 DDL을 직접 실행한다.

```sql
CREATE TABLE chapter_summary_candidates (
    id BIGSERIAL PRIMARY KEY,
    book_code VARCHAR(10) NOT NULL,
    chapter_num INTEGER NOT NULL,
    summary TEXT NOT NULL,
    generation_model VARCHAR(50),
    review_decision VARCHAR(20) NOT NULL,
    review_reason TEXT,
    review_model VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_chapter_summary_candidate UNIQUE (book_code, chapter_num)
);

CREATE INDEX idx_chapter_summary_candidates_status
    ON chapter_summary_candidates (status);

CREATE INDEX idx_chapter_summary_candidates_review_decision
    ON chapter_summary_candidates (review_decision);
```

`BIGSERIAL`은 PostgreSQL에서 자동 증가 숫자 id를 만든다. `UNIQUE (book_code, chapter_num)`은 같은 장의 후보가 중복 생성되는 것을 막는다. `status` 인덱스는 나중에 `PENDING` 후보만 조회할 때 쓰고, `review_decision` 인덱스는 `REVIEW`나 `REJECT` 후보를 빠르게 확인할 때 쓴다.

## 구현 메모

- 생성 AI는 `summary` 후보를 만든다.
- 기본 규칙 검증은 길이, 시작 문구, 종결어미, 금지어를 본다.
- Groq 검수 AI는 문장 흐름만 보고 `PASS`, `REVIEW`, `REJECT`와 짧은 이유를 반환한다.
- 배치 대상 조회는 이미 확정 요약이 있거나 후보가 있는 장을 제외한다.

## 모델 비교 메모

초기에는 Groq `llama-3.3-70b-versatile`을 생성과 검수에 모두 사용했다. 무료로 빠르게 검증할 수 있었지만, 창세기 2~7장 테스트에서 생성 문장이 나열식으로 흐르는 경우가 많아 대부분 `REVIEW`로 분류됐다.

이후 생성 모델을 Gemini `gemini-2.5-flash`로 바꾸고, 검수는 Groq를 유지했다. 같은 구간 테스트에서 후보들이 `PASS`로 분류되어 한국어 문장 자연스러움이 개선되는 것을 확인했다.

최종 방향은 다음과 같다.

- 생성: `gemini-2.5-flash`
- 검수: `llama-3.3-70b-versatile`
- 저장: `chapter_summary_candidates`
- 확정: 다음 단계에서 `PASS` 후보를 `chapter_summaries`로 반영

이 구조는 비용을 아끼면서도 LLM 결과를 무조건 신뢰하지 않는 품질 게이트를 만든다. 포트폴리오에서는 “생성형 AI를 서비스 데이터로 바로 쓰지 않고 후보/검수/승인 단계로 분리했다”는 설계 포인트로 설명할 수 있다.
