# Git 컨벤션

## 브랜치 전략

```
main        → Vercel 프로덕션 (직접 커밋 금지)
feature/*   → 기능 작업
fix/*       → 버그 수정
docs/*      → 문서 작업
chore/*     → 설정, 의존성 등
```

**네이밍:** `feature/{이슈번호}-{짧은-설명}`
```
feature/5-bible-api
feature/12-supabase-jwt-filter
fix/8-verse-key-null
```

---

## 커밋 컨벤션

```
{type}({scope}): {설명}
```

### Type

| type | 용도 |
|------|------|
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `test` | 테스트 추가/수정 |
| `docs` | 문서 |
| `chore` | 빌드, 설정, 의존성 |
| `refactor` | 동작 변경 없는 코드 개선 |

### Scope

| scope | 대상 |
|-------|------|
| `backend` | Spring Boot 공통 |
| `bible` | 성경 API |
| `auth` | Supabase JWT 인증 |
| `highlight` | 하이라이트 |
| `search` | 검색 |
| `ai` | AI/RAG |
| `db` | DB 마이그레이션 |
| `fe` | 프론트엔드 |
| `ci` | CI/CD |

### 예시

```
feat(backend): spring boot 프로젝트 초기화
feat(bible): 장별 구절 조회 엔드포인트 추가
feat(auth): supabase jwt 검증 필터 구현
feat(highlight): 하이라이트 bulk sync 엔드포인트 추가
feat(ai): 구절 벡터 임베딩 파이프라인 추가
fix(bible): verse_key null 처리 추가
test(bible): BibleService 단위 테스트 추가
chore(db): flyway 마이그레이션 초기 설정
docs(api): swagger 엔드포인트 설명 추가
```

---

## PR 규칙

**대상 브랜치:** `feature/*` → `dev` → (검토 후) `main`

**PR 제목:** 커밋 컨벤션과 동일한 형식
```
feat(bible): 장별 구절 조회 엔드포인트 추가
```

**PR 본문 필수 포함:**
```
Closes #이슈번호
```
→ `main` 머지 시 이슈 자동 close

---

## 이슈 → PR → 자동 완료 흐름

```
1. 이슈 직접 생성 (#5)
2. feature/5-bible-api 브랜치 생성
3. 작업 후 PR 생성 → Vercel 프리뷰 빌드 자동 실행
4. 빌드 확인 후 main 머지 → 이슈 자동 close
5. GitHub Projects 사용 시: 이슈 close → status 자동 Done
```

---

## GitHub 라벨

| 라벨 | 용도 |
|------|------|
| `backend` | Spring Boot 관련 |
| `frontend` | Next.js 관련 |
| `bible` | 성경 데이터/API |
| `auth` | 인증 |
| `ai` | AI/RAG |
| `bug` | 버그 |
| `docs` | 문서 |
| `chore` | 설정/의존성 |
