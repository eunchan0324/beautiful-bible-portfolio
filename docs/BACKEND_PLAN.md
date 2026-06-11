# Beautiful Bible - Spring Boot 백엔드 포트폴리오 계획

## 목적

주니어 백엔드 개발자(Java/Spring Boot) 포트폴리오 구성. 각 단계별로 개념을 학습하고 면접에서 설명할 수 있는 수준을 목표로 한다.

- 프론트엔드: `bb-bible/` (Next.js 15, Vercel  완료, Claude가 담당)
- 백엔드: `bb-bible-backend/` (Spring Boot 3.x, 본인이 직접 구현)

---

## 기술 스택

| 도구              | 버전         | 선택 이유                          |
| --------------- | ---------- | ------------------------------ |
| Java            | 21         | Virtual Threads(Loom) - 면접 포인트 |
| Spring Boot     | 3.3.x      | 최신 LTS, Spring Security 6 포함   |
| Gradle          | Kotlin DSL | 카카오/라인/네이버 표준, Maven보다 빠름      |
| PostgreSQL      | 16         | 내장 FTS, Railway 무료 티어          |
| Docker Compose  | -          | 로컬 개발 환경 표준화                   |
| Swagger/OpenAPI | 3          | springdoc-openapi로 자동 문서화      |
| jjwt            | 0.12.x     | JWT 처리 (jjwt-api/impl/jackson) |
| Railway         | -          | 배포 플랫폼 (무료, PostgreSQL 포함)     |

---

## 프로젝트 구조

```
BB-Beautiful-Bible-/
├── bb-bible/              ← 기존 프론트엔드 (Next.js)
├── bb-bible-backend/      ← 새로 생성할 Spring Boot 프로젝트
└── BACKEND_PLAN.md        ← 이 파일
```

### 패키지 구조 (도메인 주도 패키징)

```
com.bb.bible/
├── config/           # Security, CORS, Swagger 설정
├── domain/
│   ├── bible/        # entity, repository, service, controller, dto
│   ├── user/         # 회원가입/로그인
│   ├── highlight/    # 하이라이트 CRUD + 동기화
│   ├── preference/   # 사용자 설정
│   ├── bookmark/     # 책갈피
│   ├── search/       # 전문 검색
│   ├── readingplan/  # 읽기 계획
│   └── votd/         # 오늘의 말씀
├── global/
│   ├── exception/    # @ControllerAdvice
│   └── security/     # JWT Filter, Provider
└── infrastructure/
    └── importer/     # 성경 데이터 초기 임포트
```

**면접 포인트:** "레이어 패키징이 아닌 도메인 패키징을 선택한 이유는, 관련 파일이 응집되어 Bounded Context 역할을 하기 때문입니다."

---

## Phase 1: 기초 (Bible API + DB)

### 학습 목표

- JPA 엔티티 설계, `@OneToMany` / `FetchType.LAZY`
- `@RestController`, `@PathVariable`, DTO 패턴
- `CommandLineRunner`로 초기 데이터 임포트 (31,089 구절)
- Docker Compose로 로컬 PostgreSQL 실행

### DB 스키마

```sql
-- bible_books (66행)
id, book_code VARCHAR(10) UNIQUE,  -- '창','출','삼상' (프론트 bookId와 동일)
name_korean, testament ENUM(OLD/NEW), book_order INT,  chapter_count

-- bible_chapters (1,189행)
id, book_id FK, chapter_num

-- bible_verses (31,089행)
id, chapter_id FK, verse_num, verse_text TEXT,
verse_key VARCHAR(30) UNIQUE  -- '창1:1' 형식 (프론트 localStorage 키와 동일!)

-- 인덱스
CREATE INDEX idx_verse_key ON bible_verses(verse_key);
CREATE INDEX idx_verse_text_fts ON bible_verses USING gin(to_tsvector('simple', verse_text));
```

**핵심 설계:** `verse_key`가 프론트 localStorage 키(`창1:1`)와 동일 → 하이라이트 동기화 시 변환 불필요.

### 데이터 임포트

```java
@Component
public class BibleDataImporter implements CommandLineRunner {
    @Override
    @Transactional
    public void run(String... args) {
        if (bookRepo.count() > 0) return;  // 멱등성 보장
        // bible.json 파싱 후 saveAll() 배치 500건 단위
        // 개별 save() 31,089번 호출 방지
    }
}
```

데이터: `bb-bible/public/bible.json` → `src/main/resources/data/bible.json`으로 복사

### API 엔드포인트

```
GET /api/v1/bible/books
GET /api/v1/bible/books/{bookCode}
GET /api/v1/bible/books/{bookCode}/chapters
GET /api/v1/bible/books/{bookCode}/chapters/{n}   ← 성경 읽기 페이지 핵심 연동
GET /api/v1/bible/verses/{verseKey}
GET /api/v1/health
```

### 면접 포인트

- FetchType.LAZY 기본값 이유 (EAGER는 N+1 유발)
- `saveAll()` 배치 vs 개별 `save()` 성능 차이
- DTO로 엔티티 직접 노출 방지 (API 계약 ≠ DB 스키마)

---

## Phase 2: 인증 (Supabase Auth + Spring Security JWT 검증)

### 아키텍처 결정

프론트엔드는 Supabase Auth로 로그인. Spring Boot는 Supabase가 발급한 JWT를 검증만 한다.
커스텀 회원가입/로그인 엔드포인트 없음 → 인증 인프라를 Supabase에 위임.

### 학습 목표

- `SecurityFilterChain` (`WebSecurityConfigurerAdapter` deprecated 이후 방식)
- `OncePerRequestFilter`로 Supabase JWT 파싱 및 검증
- 외부 발급 JWT를 Spring Security Context에 주입하는 방법
- 첫 인증 요청 시 users 테이블 자동 동기화 (upsert)

### JWT 검증 방식 (JWKS / ES256)

> 2025-05 기준 Supabase 신규 프로젝트는 **Signing Keys(비대칭, ES256)** 가 기본.
> Legacy `SUPABASE_JWT_SECRET`(HS256)은 사용하지 않는다.

```
Supabase JWKS URL (공개키 셋, 비밀 아님)
→ application.yaml:
    supabase.jwks-url=https://{ref}.supabase.co/auth/v1/.well-known/jwks.json
    supabase.jwt-issuer=https://{ref}.supabase.co/auth/v1
→ JwtTokenProvider 부팅 시 JWKS 로드 (실패해도 부팅 유지, 첫 요청 시 lazy 재시도)
→ OncePerRequestFilter: Authorization 헤더에서 Bearer 토큰 추출
→ jjwt: 토큰 header의 kid로 공개키 선택 → 서명 + iss + exp 검증
→ claims에서 sub, email, role(=authenticated) 확인
→ SecurityContextHolder에 Authentication 주입
```

### 401 / 인가 처리

- 인증 실패: `authenticationEntryPoint`에서 **401**(body 없음 또는 JSON)
- 인증 OK + 권한 부족: `accessDeniedHandler`로 **403** (추후)

### DB 스키마

```sql
-- users (Supabase Auth에서 동기화)
id UUID PRIMARY KEY,        -- Supabase Auth user id (sub claim)와 동일
email VARCHAR(255) UNIQUE,
nickname VARCHAR(100),
role VARCHAR(20) DEFAULT 'USER',
created_at TIMESTAMP DEFAULT now()

-- password_hash 없음, refresh_tokens 테이블 없음
```

### API 엔드포인트

```
GET  /api/v1/users/me       ← JWT에서 사용자 정보 반환
PUT  /api/v1/users/me       ← 닉네임 등 프로필 수정
```

### 면접 포인트

- 외부 IdP(Supabase) JWT vs 자체 발급 JWT: 인증 인프라 위임의 트레이드오프
- 대칭(HS256) vs 비대칭(ES256 + JWKS): Secret 노출 위험, 키 회전, stateless 검증
- Stateless 검증: Supabase 서버 호출 없이 공개키만으로 신원 확인
- JWT sub claim(UUID)을 내부 user_id로 사용하는 이유
- Spring Security Filter Chain 실행 순서, `UsernamePasswordAuthenticationFilter` 앞에 두는 이유
- 첫 요청 시 users 테이블 upsert: 별도 회원가입 플로우 불필요
- 부팅 시 외부 의존성(JWKS) 실패 격리 + 지연 로딩 패턴

---

## Phase 3: 사용자 기능 (클라우드 동기화)

### 학습 목표

- 사용자 스코프 데이터 (`user_id` 필터링 필수)
- `@AuthenticationPrincipal`로 컨트롤러에서 인증 유저 주입
- **Bulk Sync 패턴** (localStorage 전체 덤프 → 서버 업서트)
- `ON CONFLICT DO UPDATE` (PostgreSQL 네이티브 upsert)
- `@Valid` + `jakarta.validation`

### DB 스키마

```sql
-- highlights
id, user_id FK, verse_key VARCHAR(30), color VARCHAR(10),
note TEXT, created_at
UNIQUE(user_id, verse_key)   ← 동시 요청에도 중복 방지

-- user_preferences (1:1)
id, user_id FK UNIQUE, font_size DEFAULT 'large',
theme_mode DEFAULT 'system', show_verse_numbers DEFAULT true

-- bookmarks
id, user_id FK, verse_key, label, created_at
UNIQUE(user_id, verse_key)
```

### API 엔드포인트

```
GET    /api/v1/highlights
POST   /api/v1/highlights
PUT    /api/v1/highlights/{verseKey}
DELETE /api/v1/highlights/{verseKey}
POST   /api/v1/highlights/sync    ← localStorage 전체 덤프 업서트 (핵심!)
GET/PUT /api/v1/preferences
GET    /api/v1/bookmarks
POST   /api/v1/bookmarks
DELETE /api/v1/bookmarks/{verseKey}
```

### Bulk Sync 요청 형식

```json
{
  "highlights": [
    { "verseKey": "창1:1", "color": "yellow", "note": null, "timestamp": "2024-01-01T00:00:00Z" }
  ]
}
```

**면접 포인트:** "Local-first with cloud sync 패턴입니다. 비로그인 = localStorage, 로그인 첫 접속 시 전체 동기화, 이후 API 사용. 오프라인에서도 동작합니다."

---

## Phase 4: 검색 우선

> 읽기 계획과 오늘의 말씀은 홈 화면/콘텐츠 전략이 확정된 뒤 추가한다.
> 현재 Phase 4의 우선순위는 홈 화면과 독립적으로 동작하는 성경 검색 API다.

| 기능        | 핵심 기술                                                         | 핵심 학습 포인트                                       |
| --------- | ------------------------------------------------------------- | ----------------------------------------------- |
| 구절 키워드 검색 | PostgreSQL FTS (`tsvector`, `plainto_tsquery('simple', ...)`) | 책 이름 → 본문 바로가기 + 키워드 → 관련 구절 목록, 한 화면에서 처리      |

### 보류 항목

| 기능        | 보류 이유                                                        | 재검토 시점 |
| --------- | ------------------------------------------------------------ | ------ |
| 오늘의 말씀   | 홈 화면의 역할, 이미지/공유/큐레이션 운영 방식이 먼저 결정되어야 함                 | 검색 API 이후 |
| 이번주 말씀 이미지 | 디자이너 협업과 사용자 후킹에는 좋지만 운영/UX 범위가 커져 Phase 5 완주를 늦출 수 있음 | Post-MVP |

### API 엔드포인트

```
GET  /api/v1/search?q=&page=&size=
```

### 검색 화면 디자인 워크플로우 (Claude Design 활용)

> 백엔드 API 명세 확정 후 → 프론트 화면 시안 → 구현 순서로 진행

1. **시안 생성:** [claude.ai/design](https://claude.ai/design)에 현재 프론트 코드베이스 연결 → 기존 디자인 시스템(컬러/타이포/컴포넌트) 학습
2. **프롬프트:** "책 이름 입력 시 본문 바로가기 + 키워드 입력 시 관련 구절 목록을 한 화면에서 보여주는 검색 UI" (초원 앱 참고)
3. **반복 수정:** 직접 편집 + 자연어 요청으로 다듬기
4. **핸드오프:** handoff bundle export → Claude Code로 전달 → `/api/v1/search` 연동 구현

**기대 효과:** Figma 대신 코드 기반 시안 → 디자인-개발 사이 변환 손실 최소화, 1인 개발자 워크플로우 검증

---

## Phase 5: 프로덕션 배포

### 주요 작업

- `@ControllerAdvice` 전역 예외 처리 (404/400/409/500 표준화)
- CORS: Vercel 도메인 + localhost:3000만 허용
- Bucket4j 레이트 리미팅 (60 req/min per IP)
- Dockerfile 멀티스테이지 빌드 (JDK 빌드 → JRE 런타임)
- `application-prod.yml` 환경변수 주입 (`DATABASE_URL`, `JWT_SECRET`)
- `ddl-auto: validate` (prod에서 `create-drop` 절대 금지)
- Railway 배포

### 면접 포인트

- 멀티스테이지 Dockerfile: 이미지 크기 절반 (JDK vs JRE)
- `ddl-auto: validate` vs `create-drop` 차이
- `spring.threads.virtual.enabled=true` (Java 21 Virtual Threads)

---

## 프론트엔드 연동 전략 (Phase 2 완료 후)

1. Supabase Auth 클라이언트 설정 및 카카오 로그인/로그아웃 UI 추가
2. Access Token / Refresh Token 관리는 Supabase client 세션 관리에 위임
3. API 클라이언트: Supabase session의 access token을 `Authorization: Bearer` 헤더로 첨부
4. 401 응답 시 백엔드 `/auth/refresh`를 만들지 않고 Supabase client의 세션 갱신 결과를 확인
5. Phase 2 프론트 검증: 로그인 직후 `GET /api/v1/users/me` 호출 및 users 자동 upsert 확인
6. Phase 3 이후: 첫 로그인 시 `POST /highlights/sync` (localStorage → 서버)
7. Dual-mode: 로그인 유저 = API, 비로그인 유저 = localStorage

---

## 전체 API 목록

| Phase | Method  | Path                                      | Auth |
| ----- | ------- | ----------------------------------------- | ---- |
| 1     | GET     | `/api/v1/bible/books`                     | No   |
| 1     | GET     | `/api/v1/bible/books/{code}/chapters/{n}` | No   |
| 1     | GET     | `/api/v1/bible/verses/{verseKey}`         | No   |
| 1     | GET     | `/api/v1/health`                          | No   |
| 2     | GET     | `/api/v1/users/me`                        | Yes  |
| 2     | PUT     | `/api/v1/users/me`                        | Yes  |
| 3     | GET     | `/api/v1/highlights`                      | Yes  |
| 3     | POST    | `/api/v1/highlights/sync`                 | Yes  |
| 3     | GET/PUT | `/api/v1/preferences`                     | Yes  |
| 3     | GET     | `/api/v1/bookmarks`                       | Yes  |
| 4     | GET     | `/api/v1/search?q=`                       | No   |
| 5     | GET     | `/actuator/health`                        | No   |

---

## 단계별 검증

| Phase | 검증 방법                                                        |
| ----- | ------------------------------------------------------------ |
| 1     | Swagger UI에서 `GET /api/v1/bible/books/창/chapters/1` → 31절 응답 |
| 2     | register → login → Bearer 토큰으로 `/users/me` 접근 성공             |
| 3     | sync 요청 → GET highlights → 동일 데이터 반환                         |
| 4     | `/search?q=사랑` 결과 확인                                      |
| 5     | Railway 배포 URL에서 프론트(Vercel) → API 호출 성공                     |

---

## Phase 6 이후 계획

Phase 1-5는 백엔드 기초, 인증, 사용자 데이터, 검색, 배포까지의 1차 로드맵으로 유지한다.

운영 배포 이후의 기능 확장 계획은 [BACKEND_PLAN2.md](BACKEND_PLAN2.md)에서 이어서 관리한다.
