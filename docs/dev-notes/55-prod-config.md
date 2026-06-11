# #55 프로덕션 환경 설정 분리

## 배경

기존 `application.yaml`에는 로컬 개발 설정과 운영에 가까운 설정이 함께 들어 있었다.
Phase 5에서는 배포 안정화를 위해 기본 설정과 프로덕션 설정을 분리한다.

## 결정

- `application.yaml`은 기본/로컬 개발 설정으로 둔다.
- `application-prod.yml`을 추가해 운영 설정을 분리한다.
- 운영에서는 `SPRING_PROFILES_ACTIVE=prod`를 사용한다.
- 운영 환경에서는 DB와 Supabase Auth 설정에 fallback 기본값을 두지 않는다.
- 운영 환경변수가 빠지면 애플리케이션이 시작되지 않도록 해서 잘못된 환경 연결을 방지한다.
- 운영에서는 `spring.jpa.hibernate.ddl-auto=validate`를 사용한다.
- 운영에서는 SQL 로그를 줄이기 위해 `show-sql=false`, `format_sql=false`를 사용한다.

## 운영 환경변수

백엔드 배포 환경에는 다음 값을 설정한다.

```env
SPRING_PROFILES_ACTIVE=prod
DB_URL=
DB_USERNAME=
DB_PASSWORD=
SUPABASE_JWKS_URL=
SUPABASE_JWT_ISSUER=
```

환경변수 템플릿은 `bb-bible-backend/.env.example`에 둔다.

## 포트폴리오 포인트

- 개발/운영 설정을 분리해 배포 안정성을 높였다.
- 운영에서는 fallback을 제거해 잘못된 DB 또는 Supabase Auth 설정으로 실행되는 위험을 줄였다.
- `ddl-auto: validate`를 사용해 운영 DB 스키마를 자동 변경하지 않고 검증만 수행하도록 했다.
