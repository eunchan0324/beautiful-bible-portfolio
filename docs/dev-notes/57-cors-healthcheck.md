# #57 CORS 및 배포 헬스체크 정리

## 배경

Phase 5에서는 프론트엔드(Vercel)와 백엔드 배포 환경이 분리되므로, 브라우저 CORS 정책과 배포 플랫폼의 health check를 명확히 정리해야 했다.
기존에는 CORS 허용 origin이 코드에 `http://localhost:3000`으로 하드코딩되어 있어 운영 도메인 변경에 대응하기 어려웠다.

## 결정

- CORS 허용 origin을 `CORS_ALLOWED_ORIGINS` 환경변수로 분리했다.
- 로컬 기본값은 `http://localhost:3000`으로 유지했다.
- 쉼표 구분 문자열을 `List<String>`으로 변환해 여러 origin을 허용할 수 있게 했다.
- `/actuator/health`를 인증 없이 접근 가능하게 열었다.
- Actuator 웹 노출은 `health`만 허용했다.
- health 상세 정보는 `show-details: never`로 숨겼다.

## 환경변수

```env
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:3000
```

## 검증

- `./gradlew test`
- `GET /actuator/health` 호출 후 `{"status":"UP"}` 확인
- CORS preflight 확인

```powershell
curl.exe -i -X OPTIONS "http://localhost:8080/api/v1/search?q=%EC%82%AC%EB%9E%91" -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: GET"
```

확인한 응답 헤더:

```http
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
```

## 포트폴리오 포인트

- 프론트엔드와 백엔드가 다른 도메인에서 운영되는 구조의 CORS 문제를 환경변수 기반으로 해결했다.
- 배포 플랫폼이 인증 없이 확인할 수 있는 표준 health check endpoint를 열었다.
- Actuator endpoint를 전체 공개하지 않고 health만 노출해 운영 정보 노출 위험을 줄였다.
