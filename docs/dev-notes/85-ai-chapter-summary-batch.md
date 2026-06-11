# 85. AI 장 요약 배치 파이프라인

## 배경

장별 요약은 사용자가 성경을 읽는 순간마다 AI를 호출하는 기능이 아니라, 미리 생성한 요약을 DB에서 조회하는 콘텐츠 기능이다. 그래서 실시간 LLM 호출보다 사전 생성 배치와 검증 후 저장 방식이 더 적합하다.

## 결정

이번 단계에서는 별도 FastAPI 서버를 추가하지 않고 Spring Boot 안에서 AI 요약 생성 파이프라인을 구성했다.

- AI 모델 호출은 결국 외부 HTTP API 요청이므로 Spring Boot에서도 처리할 수 있다.
- 이미 Spring Boot에 성경 본문 조회, `chapter_summaries` 저장, Repository 구조가 있다.
- 별도 서버를 두면 배포, 환경변수, DB 권한, 장애 지점이 늘어난다.
- Java/Spring 백엔드 안에서 AI 기능을 운영 흐름에 통합했다는 점이 포트폴리오 설명에 좋다.

## 모델 선택 메모

초기에는 OpenAI `gpt-5-nano`를 기본 후보로 보았지만, API 크레딧 선결제가 필요해 당장 무료로 검증 가능한 대안을 비교했다.

- 노트북 로컬 Ollama 모델은 응답 시간이 길고 thinking 출력이 섞여 배치 기본 모델로 부적합했다.
- Ollama Cloud `gemma4:31b-cloud`는 품질은 가능성이 있었지만, 응답 시간이 길고 클라우드 요금/정책 확인이 필요했다.
- Groq `llama-3.3-70b-versatile`은 무료 테스트가 가능하고 매우 빠르며 OpenAI 호환 API라 Spring Boot 연결 비용이 낮았다.

따라서 현재 전략은 Groq를 빠른 초안 생성기로 사용하고, 검증 실패 시 1회 재요청한 뒤 그래도 실패하면 DB에 저장하지 않는 방식이다. 향후 유료 사용이 가능해지면 OpenAI `gpt-5-nano` 또는 상위 모델을 보정/fallback 후보로 다시 검토한다.

## 구현 포인트

- `ChapterSummaryAiClient` 인터페이스로 AI 호출부를 분리했다.
- `GroqChapterSummaryClient`는 Groq Chat Completions API 호출을 담당한다.
- `OpenAiChapterSummaryClient`는 향후 유료 fallback 후보로 남겨 두었다.
- `ChapterSummaryGenerationService`는 성경 본문 수집, AI 요청, 결과 검증, DB 저장을 조율한다.
- `ChapterSummaryValidationService`는 글자 수, 시작 문구, 종결어미, 금지어를 검사한다.
- 검증 실패 시 같은 요청에 실패 사유를 포함해 1회 재요청한다.
- `ChapterSummaryBatchRunner`는 `ai.chapter-summary.enabled=true`일 때만 실행되도록 막아 기본 서버 실행에 영향을 주지 않는다.

## 검증

`./gradlew.bat test`로 서비스 테스트와 검증 로직 테스트를 통과시켰다.

## 포트폴리오 메모

이 작업은 “AI를 붙였다”보다 “AI 결과를 그대로 쓰지 않고, 도메인 규칙으로 검증한 뒤 저장하는 배치 파이프라인을 설계했다”는 점이 핵심이다. LLM은 생성 도구이고, 서비스 품질은 검증과 저장 경계에서 지킨다.
