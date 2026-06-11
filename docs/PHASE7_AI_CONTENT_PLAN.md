# Phase 7: AI 콘텐츠 묶음 (장/책/인물 요약)

> 이 문서는 구현 전 **기획/결정사항 정리 문서**다.
> 구현 회고는 별도로 `dev-notes/`에 작성한다.
> 관련 이슈: #77 (Phase 7 AI 콘텐츠 계획 정리)

---

## 배경

AI를 실서비스에 자연스럽게 녹이는 첫 단계. 사용자가 매번 접근하는 화면(성경 읽기)에 AI 콘텐츠를 정적으로 노출한다.

교회 성도 피드백:
- "성경 책마다 어떤 내용인지 짧게 알고 싶다"
- "성경 인물이 누구인지 헷갈린다 — 설명이 있으면 좋겠다"

기존 Phase 7(의미 검색)이 보류된 이유와 달리, 이 콘텐츠는 **사용 빈도가 보장된 화면에 자연스럽게 녹는다.**

---

## 핵심 패턴 (결정됨)

### "한 번 생성 + 평생 캐싱"

| 콘텐츠 | 생성 단위 | 1회 LLM 호출 수 | 사용자 호출 시 |
| --- | --- | --- | --- |
| 장별 요약 | 1,189장 | 1,189번 | DB 조회 (AI 안 부름) |
| 책 요약 | 66권 | 66번 | DB 조회 |
| 인물 설명 | ~200명 | ~200번 | DB 조회 |

- **총 ~1,400번 LLM 호출 → 1회 배치 작업**
- **사용자 입장에선 정적 콘텐츠** (응답 빠름, 비용 0)
- **백엔드 입장에선 CMS + AI 배치 파이프라인**

### AI 사용 방식

이 Phase에서 AI는 **실시간 사용자 요청 처리용 서버**가 아니라, 운영자가 콘텐츠를 미리 생성할 때 사용하는 **사전 생성 도구**다.

```
운영자/개발자가 배치 실행
→ LLM API 호출
→ 장/책/인물 설명 생성
→ 검수 후 DB 저장
→ 사용자는 Spring Boot API를 통해 DB 콘텐츠 조회
```

즉, 사용자가 성경 읽기 화면에 진입할 때마다 LLM을 호출하지 않는다. 사용자 요청 시점에는 일반 DB 조회만 수행한다.

### FastAPI 서버 여부

FastAPI 서버는 이번 Phase의 기본 선택지가 아니다.

- 메인 백엔드는 계속 **Spring Boot**다.
- AI 콘텐츠는 런타임 추론이 아니라 1회성 사전 생성이므로 상시 AI 서버가 필요하지 않다.
- 구현 후보는 Spring Boot `CommandLineRunner`, 별도 Spring Batch/CLI, 또는 로컬 생성 스크립트다.
- FastAPI는 추후 실시간 AI 보조 기능이나 별도 Python 기반 추론 서버가 필요해질 때만 검토한다.

따라서 이번 Phase의 권장 방향은 **Spring Boot 기반 배치/CLI로 생성하고, Spring Boot API로 조회하는 구조**다.

### 면접 포인트 (핵심)

> "1,400개의 AI 콘텐츠를 사전 생성하고 캐싱하는 배치 파이프라인을 구현했다.
> 런타임 비용 0, 응답 속도는 일반 DB 조회 수준.
> 매 요청마다 LLM을 호출했다면 비용 N배, 응답 1~2초 지연, 결과 일관성 문제까지 발생했을 것이다."

---

## 구현 범위

세 기능은 모두 AI 콘텐츠라는 공통점이 있지만, 사용자 노출 위치와 검수 기준이 다르므로 구현 이슈는 분리한다.

- 장 요약: 성경 읽기 화면에서 가장 자주 노출되므로 1차 MVP
- 책 요약: 책 선택/책 소개 흐름에 연결되는 2차 기능
- 인물 설명: 인물 명단 선정과 UI 방식이 필요하므로 3차 기능

### 1. 장별 요약 (1,189개)

- 한 줄 ~ 두 줄 요약 ("이 장은 ___에 대한 내용입니다")
- 성경 읽기 화면 상단에 표시
- 길이: 50~80자 권장

### 2. 책 요약 (66권)

- 책 소개 (저자, 시대, 주제, 구조)
- 책 선택 화면 또는 책 상세에서 표시
- 길이: 200~400자 권장

### 3. 인물 설명 (~200명)

- 주요 등장인물 + 짧은 설명
- 본문 속 인물명 클릭 시 팝업 또는 별도 사전 화면
- 길이: 100~200자 권장
- 어느 인물을 포함할지: 검색량/언급 빈도 기준 추후 결정

---

## 결정 필요 항목

### 1. LLM 모델 선택

후보:
- **GPT 고성능 모델** — 품질 우선 샘플 생성/검수용
- **GPT mini 계열** — 대량 생성 비용 절감용
- **Claude Haiku/Sonnet** — 비교 후보
- **Gemini Flash** — 저비용 비교 후보

비용 비교 (1,400회 호출 기준 대략):
- mini/Flash/Haiku 계열: 낮음
- 고성능 모델/Sonnet 계열: 더 높음

→ **사전 생성 1회용이라 품질 우선 추천.**

운영 기준:
- ChatGPT Pro는 샘플 생성과 프롬프트 검토에 활용할 수 있다.
- 실제 배치 파이프라인은 API 키 기반으로 실행되며, ChatGPT Pro 구독과 API 과금은 별도다.
- 1차 샘플은 고성능 모델로 생성하고, 대량 생성 전 mini 계열과 품질/비용을 비교한다.
- 최종 저장 시 `model` 컬럼에 실제 사용 모델을 기록한다.

### 2. 콘텐츠 검수 방식

⚠️ **신학적 민감성 매우 중요.** AI 생성 결과의 신뢰도 검증 필요:
- 옵션 A: 본인이 1차 검수
- 옵션 B: 목사님/신학 검수자에게 샘플 검토 요청
- 옵션 C: 사용자 피드백 받아 잘못된 항목 신고/수정

→ **추천: B 일부 샘플 + C 신고 기능** (전체 검수는 비현실적)

### 3. 트리거 위치 (어디서 보여줄지)

- **장 진입 시:** 성경 읽기 화면 상단에 작은 요약 카드 (펼치기/접기)
- **책 선택 화면:** 책 클릭 시 "책 소개" 모달 또는 책 상세 페이지
- **인물:** 본문 인용 시 인물명에 밑줄/클릭 가능 + 팝업

### 4. 인물 명단 선정 기준

- 등장 횟수 기준 상위 N명?
- "성경 인물 사전" 기준 N명?
- 어른들이 자주 헷갈리는 인물 우선?

→ **추후 결정** (먼저 장/책 요약부터 진행 가능)

### 5. 프롬프트 설계 (핵심)

신학적 안전성을 위해 프롬프트에 가드레일 포함:

```
당신은 한국 개신교 신학에 기반한 성경 안내자입니다.

다음 [본문/책/인물]에 대해 100자 이내로 설명하세요.

규칙:
- 운영 한국어 본문 기준
- 종파별 해석이 갈리는 부분은 다루지 않습니다
- 역사적/내용적 사실만 다루고, 신학적 해석은 최소화합니다
- 단정적 어조 X, "~로 알려져 있습니다" 같은 객관적 표현
```

→ **프롬프트 자체가 면접 좋은 얘기.** "AI 결과의 신학적 안전성 확보 방법"으로 설명 가능.

---

## DB 스키마

```sql
-- 장별 요약
CREATE TABLE chapter_summaries (
    id BIGSERIAL PRIMARY KEY,
    book_code VARCHAR(10) NOT NULL,
    chapter_num INTEGER NOT NULL,
    summary TEXT NOT NULL,
    model VARCHAR(50),
    generated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uk_chapter_summary UNIQUE (book_code, chapter_num)
);

-- 장별 요약 후보 + AI 문장흐름 검수 결과
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
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uk_chapter_summary_candidate UNIQUE (book_code, chapter_num)
);

-- 책 요약
CREATE TABLE book_summaries (
    id BIGSERIAL PRIMARY KEY,
    book_code VARCHAR(10) NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    author TEXT,
    era TEXT,
    theme TEXT,
    model VARCHAR(50),
    generated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 인물 설명
CREATE TABLE bible_persons (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    first_appearance_verse_key VARCHAR(30),
    model VARCHAR(50),
    generated_at TIMESTAMP NOT NULL DEFAULT now()
);
```

### 설계 의도

- `model`, `generated_at` 기록 → 나중에 모델 바꿔 재생성할 때 추적 가능
- 인물 테이블의 `first_appearance_verse_key` → "성경에서 처음 등장하는 곳" 링크 제공
- `UNIQUE` 제약으로 중복 방지

---

## API 엔드포인트

```
GET /api/v1/bible/books/{code}/chapters/{n}/summary   ← 장 요약
GET /api/v1/bible/books/{code}/summary                ← 책 요약
GET /api/v1/bible/persons                             ← 인물 목록
GET /api/v1/bible/persons/{name}                      ← 인물 상세
```

모두 비로그인 접근 가능 (정적 콘텐츠).

---

## 배치 파이프라인 (핵심 구현 포인트)

### 역할

배치 파이프라인은 세 콘텐츠를 한 번에 완성하기 위한 거대한 기능이 아니라, 먼저 장 요약으로 작게 검증한 뒤 책 요약과 인물 설명으로 확장하는 공통 생성 흐름이다.

공통 파이프라인은 장 요약 MVP에서 검증된 후 추출한다. 처음부터 책/장/인물을 모두 처리하는 범용 생성기를 만들지 않는다.

1차 목표는 다음 한 바퀴를 완성하는 것이다.

```
장 요약 샘플 생성
→ DB 저장
→ 조회 API
→ 성경 읽기 화면 표시
```

이 흐름이 검증되면 같은 패턴을 책 요약, 인물 설명에 적용한다.

### 흐름

```
1. 입력: 책 정보 + 본문 (DB에서 조회)
2. LLM 호출 (Claude/OpenAI API)
3. 결과 검증 (길이, 금칙어, 빈 응답 등)
4. DB 저장
5. 진행률/로그 출력
```

### 운영 고려사항

- **재시도 로직:** API 일시 장애 시 exponential backoff
- **중간 실패 대응:** `UNIQUE` 제약 + idempotent INSERT (`ON CONFLICT DO NOTHING`)로 재실행 가능
- **속도 제한:** API 분당 토큰 제한 고려, 청크 단위로 처리
- **로컬 실행 vs CI:** 1회용이라 로컬에서 돌리고 결과 DB 직접 적재

→ Spring Boot의 `CommandLineRunner` 또는 별도 CLI 도구로 실행

---

## 화면 구성

### 성경 읽기 화면 (장 요약 추가)

```
┌─ 창세기 1장 ────────────────────┐
│ 💡 이 장 한눈에 보기 [펼치기]    │  ← 새 추가
│                                  │
│ 1 샘플 구절 본문입니다...       │
│ 2 ...                            │
└──────────────────────────────────┘
```

### 책 선택 화면 (책 소개 추가)

```
[창세기] 탭 클릭 시
  → 소개 모달 또는 첫 진입 시 한 번만 표시
  → "다시 보지 않기" 옵션
```

### 인물 사전

- 별도 화면 (`/bible/persons`)
- 본문에서 인물명 클릭 시 팝업으로도 가능 (선택 사항)

---

## 면접 포인트

- **사전 생성 + 캐싱 패턴** — 런타임 LLM 호출과의 비용/응답속도/일관성 비교
- **신학적 안전성을 위한 프롬프트 설계** — AI 결과의 도메인 적합성 확보
- **배치 파이프라인의 멱등성** — `UNIQUE` 제약 + `ON CONFLICT DO NOTHING`으로 재실행 안전성
- **재시도/속도 제한 처리** — 외부 API 의존성의 운영 안정성
- **모델 변경 추적** — `model`, `generated_at` 컬럼으로 콘텐츠 버전 관리
- **콘텐츠 검수 흐름** — AI 단독 결정의 한계, 사람 검수와 사용자 피드백 결합

---

## 작업 순서

1. ~~기획서 작성 (이 문서)~~ ← 현재
2. GitHub 이슈 분리 생성 (구현용)
3. 공통 설계 정리
   - 런타임 LLM 호출 없음
   - FastAPI 서버 없음
   - Spring Boot 배치/CLI 또는 로컬 생성 스크립트 사용
   - 모델, 프롬프트, 검수 방식 결정
4. 1차 MVP: 장 요약
   - 프롬프트 설계 + 샘플 5~10개 생성
   - 샘플 검수
   - `chapter_summaries` 스키마
   - 장 요약 조회 API
   - 성경 읽기 화면 연동
5. 2차: 책 요약
   - 프롬프트 설계 + 샘플 검수
   - `book_summaries` 스키마
   - 책 요약 조회 API
   - 책 선택/책 소개 화면 연동
6. 3차: 인물 설명
   - 인물 명단 선정 기준 결정
   - 프롬프트 설계 + 샘플 검수
   - `bible_persons` 스키마
   - 인물 조회 API
   - 인물 사전 또는 팝업 연동
7. 사용자 피드백 신고 기능 (잘못된 내용 신고용)
8. 회고 (`dev-notes/N-phase7-ai-content.md`)

---

## 추천 GitHub 이슈 분리

### 1차로 바로 만들 이슈

- `[docs/ai] Phase 7 AI 콘텐츠 계획 정리`
- `[feat/be] 장별 요약 MVP 구현`
- `[feat/be] 책 요약 MVP 구현`
- `[docs/ai] 인물 설명 범위 및 명단 선정`

### 이후 필요 시 세분화할 이슈

- `[feat/ai] AI 콘텐츠 공통 생성 파이프라인 구현`
- `[feat/fe] 장별 요약 프론트 연동`
- `[feat/fe] 책 요약 프론트 연동`
- `[feat/be] 인물 설명 API 구현`
- `[feat/fe] 인물 사전 또는 팝업 UI 구현`

처음부터 모든 세부 이슈를 만들기보다, 장 요약 MVP를 통해 생성-저장-조회-화면 표시 흐름을 검증한 뒤 책/인물 작업을 세분화한다.

### 장별 요약 MVP 완료 기준

- 장 요약 샘플 5~10개를 생성하고 검수한다.
- `chapter_summaries` 저장 방식과 필수 컬럼을 확정한다.
- 장 요약 조회 API 명세를 확정한다.
- 성경 읽기 화면에서 접기/펼치기 가능한 작은 요약 영역으로 표시한다.
- 사용자 요청 시 LLM을 호출하지 않고 DB 조회만 수행한다.

---

## 향후 확장

- 콘텐츠 재생성: 모델 업그레이드 시 batch 재실행 (멱등 설계 덕분에 안전)
- 다국어 확장: 같은 패턴으로 영어/일본어 요약도 가능
- 사용자 피드백 누적: "도움 됐어요/도움 안 됐어요" 데이터로 콘텐츠 품질 평가

---

## 참고

- 메인 백엔드 계획: [BACKEND_PLAN.md](BACKEND_PLAN.md)
- Phase 6+ 확장 계획: [BACKEND_PLAN2.md](BACKEND_PLAN2.md)
- Phase 7.5 (하단 네비게이션 속도 개선): [PHASE7_5_NAV_SPEED_PLAN.md](PHASE7_5_NAV_SPEED_PLAN.md)
- Phase 8 (우리 교회 홈 & 일정 캘린더): [PHASE8_CHURCH_HOME_CALENDAR_PLAN.md](PHASE8_CHURCH_HOME_CALENDAR_PLAN.md)
- Phase 9 (PWA 오늘의 말씀 알림): [PHASE9_PWA_TODAY_VERSE_NOTIFICATION_PLAN.md](PHASE9_PWA_TODAY_VERSE_NOTIFICATION_PLAN.md)
- 아이디어 백로그: [IDEAS_BACKLOG.md](IDEAS_BACKLOG.md)
- 보류 (AI 의미 검색): [PHASE7_RAG_PLAN_ARCHIVED.md](PHASE7_RAG_PLAN_ARCHIVED.md)
- 장별 요약 프롬프트 샘플: [ai/chapter-summary-prompt-samples.md](ai/chapter-summary-prompt-samples.md)
- 결정사항 회고 누적: [dev-notes/](dev-notes/)
