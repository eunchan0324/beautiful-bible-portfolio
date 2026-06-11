# 96. OpenAI 장별 요약 생성 설정 최적화

## 배경

Gemini 무료 티어는 일일 요청 수 제한이 낮아 창세기 전체 생성도 안정적으로 끝내기 어려웠다. 그래서 `gpt-5-nano`로 전환해 테스트했지만, 초기 설정에서는 장 하나를 생성하는 데 40초 이상 걸리고 Groq 검수까지 이어져 전체 흐름이 느렸다.

## 결정

OpenAI 생성 호출은 빠른 요약 작업에 맞춰 낮은 지연 설정으로 보낸다.

- `AI_CHAPTER_SUMMARY_REASONING_EFFORT=low`
- `AI_CHAPTER_SUMMARY_TEXT_VERBOSITY=low`

`gpt-5-nano`는 저렴한 요약 모델이지만 reasoning 모델 계열이므로, 기본 reasoning 설정을 그대로 두면 짧은 요약 작업에도 시간이 길어질 수 있다. 처음에는 `minimal`로 테스트했지만 종결어미와 길이 규칙을 자주 놓쳤고, `low`로 올린 뒤 창세기 34~36장 테스트에서 validation 실패 없이 후보가 저장되었다.

## 검수 방식 변경

기존에는 생성 후 Groq로 문장 흐름을 다시 검수했다. 하지만 유료 OpenAI 생성으로 바꾼 뒤에는 이 방식의 장점이 줄었다.

- 장당 LLM 호출이 2번 발생한다.
- Groq가 `나열식 표현`을 보수적으로 잡아 PASS 비율이 낮아질 수 있다.
- 생성 모델과 검수 모델의 판단 기준이 달라 운영 판단이 흔들릴 수 있다.

그래서 `AI_CHAPTER_SUMMARY_REVIEW_PROVIDER=none` 옵션을 추가했다. 이 설정에서는 별도 LLM 검수 없이, 코드의 rule validation을 통과한 요약을 `PASS` 후보로 저장한다.

## 추천 실행 설정

```env
AI_CHAPTER_SUMMARY_GENERATION_PROVIDER=openai
AI_CHAPTER_SUMMARY_MODEL=gpt-5-nano
AI_CHAPTER_SUMMARY_API_KEY=...
AI_CHAPTER_SUMMARY_BASE_URL=https://api.openai.com/v1
AI_CHAPTER_SUMMARY_REASONING_EFFORT=low
AI_CHAPTER_SUMMARY_TEXT_VERBOSITY=low
AI_CHAPTER_SUMMARY_REVIEW_PROVIDER=none
AI_CHAPTER_SUMMARY_MAX_ATTEMPTS=2
AI_CHAPTER_SUMMARY_REQUEST_DELAY_MILLIS=0
```

이 흐름은 "AI가 만든 문장을 무조건 확정"하는 것이 아니다. 생성 결과는 여전히 후보 테이블에 먼저 저장되고, 최종 반영은 `PASS + PENDING` 승인 SQL로 분리되어 있다.

## 정리

이번 변경의 핵심은 전체 성경 생성 비용보다 운영 속도와 판단 흐름이다. `gpt-5-nano + review none` 조합은 장당 호출 수를 줄여 빠르게 후보를 만들고, 품질 관리는 rule validation과 운영 승인 단계에서 처리하는 방향이다. 창세기 배치 작업은 이 설정으로 이어서 진행한다.
