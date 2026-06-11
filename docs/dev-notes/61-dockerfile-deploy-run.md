# #61 Dockerfile 및 배포 실행 설정 추가

## 배경

Phase 5의 다음 단계는 Spring Boot 백엔드를 배포 플랫폼에서 일관되게 빌드하고 실행할 수 있게 만드는 것이다.
로컬에서는 `./gradlew bootRun`으로 실행하지만, 배포 환경에서는 실행 가능한 jar를 만들고 해당 jar를 컨테이너에서 실행하는 방식이 더 명확하다.

## 결정

- `bb-bible-backend/Dockerfile`을 추가했다.
- Dockerfile은 멀티스테이지 빌드를 사용한다.
- builder stage에서는 Gradle wrapper로 `bootJar`를 실행한다.
- runtime stage에서는 빌드 결과 jar만 복사해 실행한다.
- 컨테이너 기본 profile은 `prod`로 둔다.
- `.dockerignore`를 추가해 로컬 빌드 산출물과 실제 환경변수 파일이 Docker build context에 들어가지 않게 했다.

## 검증

- `./gradlew bootJar`
- `docker build -t beautiful-bible-backend:test .`

Docker 이미지 빌드는 성공했다.

컨테이너 실행 시 `prod` profile에서는 다음 환경변수가 필요함을 확인했다.

```env
DB_URL=
DB_USERNAME=
DB_PASSWORD=
SUPABASE_JWKS_URL=
SUPABASE_JWT_ISSUER=
CORS_ALLOWED_ORIGINS=
```

로컬에서 환경변수 없이 실행하면 prod 설정의 필수값이 없어 부팅이 실패한다.
이 부분은 #62 Railway 배포 및 프로덕션 환경변수 연결에서 실제 운영 환경변수로 검증한다.

## 포트폴리오 포인트

- 멀티스테이지 Dockerfile로 빌드 환경과 실행 환경을 분리했다.
- 최종 이미지에는 Gradle 빌드 도구가 아니라 실행 jar만 포함되도록 구성했다.
- `.dockerignore`로 빌드 컨텍스트를 줄이고 실제 환경변수 파일이 이미지 빌드에 섞이지 않게 했다.
- 배포 실행 기본값을 `prod` profile로 두어 운영 설정 누락을 빠르게 드러내도록 했다.
