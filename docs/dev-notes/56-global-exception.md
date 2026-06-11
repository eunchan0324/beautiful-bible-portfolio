# #56 전역 예외 처리 정리

## 배경

Phase 5에서는 실제 배포를 앞두고 API 실패 응답을 프론트엔드가 안정적으로 해석할 수 있게 정리해야 했다.
기존에는 서비스에서 `orElseThrow()` 또는 `IllegalArgumentException`을 직접 사용하고 있어, 없는 리소스와 잘못된 요청을 HTTP 상태 코드로 명확히 구분하기 어려웠다.

## 결정

- 공통 에러 응답 DTO `ErrorResponse`를 만들었다.
- `@RestControllerAdvice` 기반 `GlobalExceptionHandler`에서 API 예외 응답을 한 곳에서 관리한다.
- 없는 리소스는 `NotFoundException`으로 표현하고 404로 응답한다.
- 잘못된 요청은 `IllegalArgumentException`을 400으로 응답한다.
- DB unique 제약 등 데이터 충돌은 `DataIntegrityViolationException`을 409로 응답한다.
- 예상하지 못한 예외는 500으로 응답하되, 내부 예외 메시지는 그대로 노출하지 않는다.

## 응답 형식

```json
{
  "code": "NOT_FOUND",
  "message": "Bible book not found",
  "timestamp": "2026-05-22T18:07:25.9131234"
}
```

## 구현 포인트

- `ErrorResponse`
- `GlobalExceptionHandler`
- `NotFoundException`
- `BibleBookService`의 성경책/장 조회 실패를 404로 변경
- `HighlightService`의 하이라이트 수정 실패를 404로 변경

## 검증

- `./gradlew test`
- Swagger/API에서 `GET /api/v1/bible/books/없는책` 호출 후 404 공통 에러 응답 확인

## 포트폴리오 포인트

- API 실패 응답을 표준화해 프론트엔드 연동 안정성을 높였다.
- 400, 404, 409, 500의 의미를 분리해 HTTP 상태 코드 설계 기준을 적용했다.
- DB 예외 메시지를 그대로 노출하지 않도록 하여 운영 환경의 정보 노출 위험을 줄였다.
- 도메인 서비스는 비즈니스 예외를 던지고, HTTP 응답 변환은 전역 핸들러가 담당하도록 역할을 분리했다.
