# #63 API Rate Limit 적용

## 배경

백엔드가 Render로 외부 배포되면서 공개 API가 실제 인터넷에서 호출될 수 있는 상태가 되었다.
검색 API처럼 인증 없이 열려 있는 endpoint는 과도한 요청이 들어오면 DB와 서버 리소스를 빠르게 소모할 수 있다.
Phase 5에서는 완전한 보안 체계보다, 운영 환경에서 최소한의 요청 보호 장치를 먼저 두는 것을 목표로 했다.

## 결정

- Bucket4j를 사용해 인메모리 token bucket 방식의 rate limit을 적용했다.
- 클라이언트 구분 키는 우선 IP 기준으로 잡았다.
- `X-Forwarded-For`가 있으면 첫 번째 IP를 사용해 Render 같은 프록시 환경을 고려했다.
- 제한값은 환경변수로 분리해 로컬/운영에서 조정할 수 있게 했다.
- health check, Swagger, CORS preflight 요청은 제한 대상에서 제외했다.
- 제한 초과 시 공통 에러 응답 형식에 맞춰 `429 TOO_MANY_REQUESTS`를 반환한다.

## 환경변수

```env
RATE_LIMIT_CAPACITY=60
RATE_LIMIT_REFILL_TOKENS=60
RATE_LIMIT_REFILL_DURATION_SECONDS=60
```

의미:

- `RATE_LIMIT_CAPACITY`: 버킷에 최대로 쌓일 수 있는 요청 토큰 수
- `RATE_LIMIT_REFILL_TOKENS`: 주기마다 다시 채워지는 토큰 수
- `RATE_LIMIT_REFILL_DURATION_SECONDS`: 토큰을 다시 채우는 주기

예를 들어 세 값이 `60`, `60`, `60`이면 IP별로 60초에 최대 60회 요청을 허용한다.

## 검증

로컬 테스트에서는 값을 작게 낮춰 제한 초과 응답을 확인했다.

```env
RATE_LIMIT_CAPACITY=3
RATE_LIMIT_REFILL_TOKENS=3
RATE_LIMIT_REFILL_DURATION_SECONDS=60
```

반복 호출:

```powershell
curl.exe "http://localhost:8080/api/v1/search?q=%EC%82%AC%EB%9E%91&page=0&size=1"
```

4번째 요청에서 확인한 응답:

```json
{
  "code": "TOO_MANY_REQUESTS",
  "message": "Too many requests",
  "timestamp": "2026-05-23T00:13:04.497609"
}
```

## 한계

- 현재 구현은 애플리케이션 메모리에 버킷을 저장한다.
- 서버 인스턴스가 여러 개로 늘어나면 인스턴스별로 제한이 따로 적용된다.
- 서버가 재시작되면 제한 상태가 초기화된다.
- 포트폴리오 단계에서는 단일 인스턴스 Render 배포를 기준으로 충분하지만, 확장 시 Redis 같은 외부 저장소 기반 rate limit을 검토할 수 있다.

## 포트폴리오 포인트

- 공개 API 배포 이후 운영 관점의 요청 보호 장치를 추가했다.
- token bucket 알고리즘을 사용해 단순 차단이 아닌 시간 기반 요청 허용량을 설계했다.
- 제한값을 환경변수로 분리해 운영 환경에서 코드 변경 없이 정책을 조정할 수 있게 했다.
- 프록시 배포 환경의 `X-Forwarded-For` 헤더를 고려해 클라이언트 IP를 판별했다.
