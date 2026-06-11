# 97. 전체 장별 AI 요약 생성 운영 메모

## 배경

Phase 7의 1차 목표였던 장별 요약은 사용자가 성경 읽기 화면에 들어올 때마다 LLM을 호출하는 기능이 아니다. 전체 1,189장 요약을 미리 생성해 DB에 저장하고, 실제 사용자 요청 시에는 `chapter_summaries`를 조회하는 정적 콘텐츠 방식으로 설계했다.

이 작업은 #95 창세기 배치와 #96 OpenAI 생성 설정 최적화 이후, 같은 운영 루틴을 성경 전체 장으로 확장한 단계다.

## 운영 방식

1. `gpt-5-nano`로 장별 요약 후보를 생성했다.
2. 후보는 바로 최종 테이블에 넣지 않고 `chapter_summary_candidates`에 먼저 저장했다.
3. rule validation을 통과한 후보는 `PASS + PENDING`으로 남겼다.
4. `PASS + PENDING` 후보만 SQL로 일괄 승인해 `chapter_summaries`에 반영했다.
5. `REVIEW + PENDING` 후보는 끝까지 보류한 뒤, 마지막에 소량만 직접 검수했다.

실행은 처음에는 50개 단위로 끊어서 진행했다. 이렇게 하면 비용과 품질을 중간에 확인할 수 있고, 문제가 생겼을 때 영향 범위를 작게 유지할 수 있다.

## 최종 설정

```env
AI_CHAPTER_SUMMARY_GENERATION_PROVIDER=openai
AI_CHAPTER_SUMMARY_MODEL=gpt-5-nano
AI_CHAPTER_SUMMARY_BASE_URL=https://api.openai.com/v1
AI_CHAPTER_SUMMARY_REASONING_EFFORT=low
AI_CHAPTER_SUMMARY_TEXT_VERBOSITY=low
AI_CHAPTER_SUMMARY_REVIEW_PROVIDER=none
AI_CHAPTER_SUMMARY_MAX_ATTEMPTS=2
AI_CHAPTER_SUMMARY_REQUEST_DELAY_MILLIS=0
```

`review-provider=none`은 AI 검수를 완전히 생략한다는 뜻이 아니라, 별도 LLM 검수 대신 코드의 rule validation과 운영 승인 단계를 품질 게이트로 사용한다는 뜻이다.

## 결과

- `chapter_summaries` 기준 전체 1,189장 요약 생성 완료
- 누락 장 수 0개 확인
- `(book_code, chapter_num)` 중복 없음 확인
- Swagger에서 대표 샘플 장 요약 조회 확인

마지막에 남은 5개 REVIEW 후보는 자동 재생성을 반복하기보다 사람이 직접 확인해 수동 요약으로 정리했다. 이 단계에서는 자동화보다 짧은 수동 검수가 더 빠르고 품질도 안정적이었다.

## 배운 점

AI 기능의 핵심은 모델 호출 자체보다 운영 흐름이다.

- 후보 테이블과 최종 테이블을 분리해야 잘못된 생성 결과를 바로 서비스에 노출하지 않을 수 있다.
- 대량 생성은 한 번에 전부 처리하기보다 작은 배치로 나누는 편이 비용, 실패, 품질을 제어하기 쉽다.
- 저렴한 모델도 프롬프트, validation, 승인 루틴이 있으면 정적 콘텐츠 생성에는 충분히 사용할 수 있다.
- 모든 항목을 사람이 전수 검수하는 것은 현실적이지 않으므로, 자동 통과와 보류 검수를 나누는 방식이 필요하다.

이번 작업으로 Phase 7의 장별 요약은 "생성 → 후보 저장 → 승인 → 최종 조회" 흐름이 전체 데이터 규모에서도 동작한다는 것을 확인했다.
