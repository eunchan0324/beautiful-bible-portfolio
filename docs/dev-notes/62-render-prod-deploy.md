# #62 Render 배포 및 프로덕션 환경변수 연결

## 배경

Phase 5의 목표는 백엔드를 실제 외부 URL로 배포하고, 프론트엔드 배포 앱에서 API를 호출할 수 있게 만드는 것이다.
초기 후보였던 Railway는 trial credit 기반이라 장기 무료 운영에 불리하다고 판단했다.
비용 부담을 줄이기 위해 무료 web service를 제공하는 Render로 배포 대상을 변경했다.

## 결정

- 백엔드 배포 플랫폼을 Railway에서 Render로 변경했다.
- Render Web Service를 Docker 기반으로 생성했다.
- monorepo 구조이므로 Root Directory와 Docker build context를 `bb-bible-backend`로 설정했다.
- Dockerfile path는 `bb-bible-backend/Dockerfile`로 설정했다.
- health check path는 `/actuator/health`로 설정했다.
- Render 환경변수에 prod 실행에 필요한 값을 연결했다.
- Vercel 프론트엔드의 `NEXT_PUBLIC_API_BASE_URL`을 Render 백엔드 URL로 변경하고 재배포했다.

## 연결한 환경변수

Render 백엔드 서비스:

```env
SPRING_PROFILES_ACTIVE=prod
DB_URL=
DB_USERNAME=
DB_PASSWORD=
SUPABASE_JWKS_URL=
SUPABASE_JWT_ISSUER=
CORS_ALLOWED_ORIGINS=
```

Vercel 프론트엔드:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend.onrender.com
```

## 검증

- Render 배포 로그에서 DB 연결 성공 확인
- `GET https://your-backend.onrender.com/actuator/health`
- `GET https://your-backend.onrender.com/api/v1/search?q=<query>&page=0&size=10`
- Vercel 배포 앱 검색 화면에서 Render 백엔드 API 호출 성공 확인

## 주의 사항

- Render Free instance는 비활성 상태가 지속되면 spin down될 수 있다.
- 첫 요청은 cold start 때문에 느릴 수 있다.
- 루트 경로 `/`는 공개 API가 아니므로 401이 나오는 것이 정상이다.
- API 검증은 `/actuator/health` 또는 `/api/v1/search` 같은 공개 endpoint로 한다.

## 포트폴리오 포인트

- 비용 제약을 고려해 배포 플랫폼을 재선정했다.
- monorepo에서 백엔드만 배포되도록 root/build context를 분리했다.
- Dockerfile 기반 배포와 환경변수 기반 prod 설정을 실제 배포 환경에 연결했다.
- 백엔드 배포 URL을 프론트엔드 프로덕션 환경변수에 연결해 end-to-end 검색 기능을 검증했다.
