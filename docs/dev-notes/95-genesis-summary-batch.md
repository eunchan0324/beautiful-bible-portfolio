# 95. 창세기 장별 요약 후보 배치 진행 메모

## 배경

창세기부터 실제 장별 요약 데이터를 채우기 시작했다. 처음에는 `gemini-2.5-flash`를 사용했지만 무료 티어의 일일 요청 제한에 걸려 전체 50장을 한 번에 생성하기 어려웠다.

## 진행 중 확인한 점

- Gemini 무료 티어는 품질은 괜찮았지만 하루 요청 수 제한 때문에 창세기 전체 생성에도 시간이 오래 걸렸다.
- `gpt-5-nano`로 전환하자 비용은 거의 줄지 않았지만, 초기 설정에서는 응답이 느리고 Groq 검수까지 더해져 장당 시간이 길었다.
- OpenAI 호출에 `reasoning-effort=low`, `text-verbosity=low`를 적용하고 `review-provider=none`으로 바꾼 뒤 창세기 34~36장 테스트에서 속도와 규칙 준수가 개선되었다.

## 현재 운영 루틴

1. 후보를 소량 생성한다.
2. rule validation을 통과한 후보는 `PASS`, `review_model=none`으로 저장한다.
3. `PASS + PENDING` 후보만 `chapter_summaries`에 반영한다.
4. 길이 초과, 종결어미 오류 등으로 남은 `REVIEW` 후보는 나중에 삭제 후 재생성하거나 사람이 수동 승인한다.

## 추천 실행 설정

```env
AI_CHAPTER_SUMMARY_GENERATION_PROVIDER=openai
AI_CHAPTER_SUMMARY_MODEL=gpt-5-nano
AI_CHAPTER_SUMMARY_BASE_URL=https://api.openai.com/v1
AI_CHAPTER_SUMMARY_REASONING_EFFORT=low
AI_CHAPTER_SUMMARY_TEXT_VERBOSITY=low
AI_CHAPTER_SUMMARY_REVIEW_PROVIDER=none
AI_CHAPTER_SUMMARY_TARGET_LIMIT=5
AI_CHAPTER_SUMMARY_MAX_ATTEMPTS=2
AI_CHAPTER_SUMMARY_REQUEST_DELAY_MILLIS=0
```

## 정리

#95 자체는 코드 변경보다 데이터 생성 운영 작업이다. 다만 실제 진행 중 생성 속도와 검수 구조 문제가 드러나 #96의 OpenAI 최적화 작업을 함께 반영했다.

창세기 최종 요약은 `chapter_summaries` 기준 50장까지 채웠다. `chapter_summary_candidates`의 `PASS + APPROVED` 수가 48개인 이유는 후보 테이블을 만들기 전에 이미 최종 테이블에 들어간 초기/수동 요약 2개가 있기 때문이다. 서비스 조회 기준은 최종 테이블이므로 창세기 데이터는 완성으로 본다.
