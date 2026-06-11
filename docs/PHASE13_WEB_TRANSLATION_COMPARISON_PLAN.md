# Phase 13: WEB 영어 역본 비교 기획

> 이 문서는 #180 영어 역본 추가와 역본 비교 UX의 제품/데이터 방향을 정리한다.
> 실제 구현은 WEB 데이터 변환, 프론트엔드 UI, 백엔드 확장 이슈로 나누어 진행한다.

---

## GitHub 이슈

- 이슈 번호: #180
- 이슈 제목: `[docs/ai] Phase 13 영어 역본 비교 기획 정리`

---

## 배경

현재 Beautiful Bible은 한국어 성경 본문을 기준으로 읽기, 하이라이트, 저장, 통독 기능을 제공한다.
다음 단계에서는 사용자가 한국어 본문을 읽으면서 영어 역본을 함께 볼 수 있도록 한다.

목표는 영어 성경 앱을 새로 만드는 것이 아니라, 기존 성경 읽기 경험에 "대조 역본"을 얹는 것이다.

참고 앱인 초원은 본문 상단에서 기본 역본과 대조 역본을 선택하고, 각 절 아래에 대조 역본 문장을 함께 보여준다.
Beautiful Bible도 이 방향을 참고하되, MVP에서는 선택지를 최소화한다.

---

## 라이선스 확인

World English Bible은 공식 페이지와 eBible.org 상세 페이지에서 Public Domain으로 안내된다.

확인한 공식 출처는 다음과 같다.

- https://worldenglish.bible/
- https://ebible.org/find/details.php?id=engwebp
- https://ebible.org/eng-web/copyright.htm

공식 안내의 핵심은 다음과 같다.

- World English Bible 본문은 Public Domain이다.
- 복사, 출판, 배포, 판매, 인용, 낭독, 교육 목적 사용이 가능하다.
- 단, "World English Bible" 명칭은 eBible.org의 상표다.
- 본문을 변경한 경우 변경본을 World English Bible이라고 부르면 안 된다.

따라서 앱에서 WEB 본문을 그대로 저장하고 표시하는 것은 가능하다고 판단한다.
다만 본문을 정규화하는 과정에서 의미 있는 텍스트 변경을 하지 않고, 출처와 버전을 문서화해야 한다.

---

## 사용할 WEB 판본

MVP에서는 eBible.org의 `engwebp`를 기준으로 한다.

```text
Title: World English Bible
Abbreviation: WEBP
ID: engwebp
Books: Protestant 66 books
Language: English, American
Status: Public Domain
```

이유는 다음과 같다.

- 현재 앱은 66권 성경 구조를 기준으로 한다.
- `eng-web` Classic은 Deuterocanon/Apocrypha를 포함한다.
- `engwebp`는 66권만 포함하므로 현재 성경 책/장 구조와 맞추기 쉽다.
- Old Testament에서 하나님의 이름을 `LORD`/`GOD`로 표기해 교회 사용자에게 더 익숙할 가능성이 높다.

UI에서는 사용자가 이해하기 쉽게 `WEB`로 표시할 수 있다.
데이터/코드 내부에서는 정확한 출처 추적을 위해 `WEBP` 또는 `engwebp`를 함께 남긴다.

---

## 데이터 확보 방법

eBible.org 상세 페이지에서 여러 다운로드 형식을 제공한다.

MVP 후보는 다음 순서로 검토한다.

```text
1. BibleWorks import (VPL) + SQL: engwebp_vpl.zip
2. USFM: engwebp_usfm.zip
3. Browser Bible module: engwebp_browserBible.zip
4. HTML zip: engwebp_html.zip
```

추천은 `VPL + SQL`이다.

이유는 다음과 같다.

- 절 단위 데이터로 변환하기 쉽다.
- SQL 파일이 함께 제공되면 구조를 참고할 수 있다.
- 현재 `bible.json`처럼 `verse_key -> verse_text` 구조로 변환하기 좋다.

USFM은 원본 보존성이 좋지만 파싱 규칙을 더 신중히 다뤄야 한다.
VPL로 절 단위 매핑이 충분히 안정적이면 MVP에서는 VPL을 사용하고, 원본 아카이브 링크와 다운로드 날짜를 문서화한다.

---

## 현재 구조에서의 핵심 제약

현재 성경 읽기 화면은 백엔드 API로 본문을 가져오지 않는다.
프론트엔드의 `public/bible.json` 정적 파일을 읽고, Zustand store에서 파싱해 화면에 표시한다.

```text
bb-bible-frontend/public/bible.json
-> fetch('/bible.json')
-> groupBibleByBook()
-> 성경 읽기 화면 렌더링
```

따라서 Render 무료 서버가 cold start 상태여도 기본 성경 읽기는 가능하다.
이 구조는 사용자가 가장 자주 쓰는 읽기 경험을 서버 상태와 분리해 둔 좋은 결정이다.

백엔드에도 `bible_verses` 테이블과 장 조회 API가 있지만, 현재 프론트 성경 읽기 화면의 핵심 데이터 소스는 정적 JSON이다.
WEB 비교 기능도 MVP에서는 이 장점을 유지한다.

현재 백엔드 `bible_verses`는 단일 본문을 저장하는 구조다.

```text
bible_verses
- id
- chapter_id
- verse_num
- verse_text
- verse_key unique
```

`verse_key`는 프로젝트 전체에서 중요한 불변 규칙이다.

```text
창1:1
요3:16
```

하이라이트, 저장, 통독은 모두 이 위치 키를 기준으로 연결된다.
따라서 영어 역본을 추가하더라도 `verse_key` 형식은 절대 바꾸지 않는다.

문제는 백엔드까지 다중 역본을 확장할 경우 현재 `verse_key`가 unique라서 같은 절의 영어 본문을 같은 테이블에 그대로 넣을 수 없다는 점이다.

---

## MVP 데이터 방향

MVP에서는 백엔드 API보다 프론트 정적 JSON 추가를 우선한다.

```text
public/bible.json       // 기존 한국어 본문
public/bible-webp.json  // WEBP 영어 본문
```

이유는 다음과 같다.

- 현재 성경 읽기 화면이 이미 정적 JSON 기반이다.
- Render 서버가 느려도 성경 읽기와 역본 비교가 가능하다.
- DB 마이그레이션 없이 먼저 사용자 경험을 검증할 수 있다.
- 영어 대조 본문은 로그인/개인화 데이터가 아니라 공용 읽기 데이터다.

`bible-webp.json`도 기존과 같은 `verse_key -> verse_text` 형태로 변환한다.

```json
{
  "창1:1": "In the beginning, God created the heavens and the earth.",
  "요1:1": "In the beginning was the Word, and the Word was with God, and the Word was God."
}
```

프론트에서는 기존 한국어 `parsedData`와 WEBP `parsedData`를 같은 `verse_key` 기준으로 매칭한다.
WEBP 문장이 없는 절은 한국어만 표시한다.

백엔드 다중 역본 모델은 검색, 서버 API, 관리자 검증이 필요해졌을 때 후속 단계로 확장한다.

---

## 백엔드 확장 방향

### 후속 추천안: 같은 절 위치에 역본 축 추가

백엔드까지 다중 역본을 지원할 때는 `bible_verses`에 `translation_code`를 추가하는 방향을 추천한다.

```text
bible_verses
- id
- chapter_id
- translation_code
- verse_num
- verse_text
- verse_key

unique(translation_code, verse_key)
index(chapter_id, translation_code, verse_num)
```

예시는 다음과 같다.

```text
translation_code | verse_key | verse_text
KOR              | 요1:1     | [한국어 본문 예시 생략]
WEBP             | 요1:1     | In the beginning was the Word...
```

이 방식의 장점은 다음과 같다.

- 기존 `BibleVerse` 개념을 크게 바꾸지 않는다.
- 장 조회 API에서 기본 역본과 대조 역본을 함께 조회하기 쉽다.
- `verse_key`를 계속 위치 식별자로 유지할 수 있다.
- 하이라이트/저장/통독은 기존처럼 `verse_key`만 사용하면 된다.

주의할 점은 다음과 같다.

- 기존 `verse_key unique` 제약은 제거하거나 복합 unique로 바꿔야 한다.
- 검색 API는 기본적으로 한국어 본문만 검색할지, 영어도 검색할지 정책이 필요하다.
- 기존 데이터는 `translation_code = KOR` 같은 기본값으로 마이그레이션해야 한다.

### 보류안: 본문 테이블 분리

더 정규화된 구조는 절 위치와 번역 본문을 분리하는 것이다.

```text
bible_verse_locations
- id
- chapter_id
- verse_num
- verse_key

bible_verse_texts
- id
- verse_location_id
- translation_code
- verse_text
```

이 방식은 장기적으로 깔끔하지만, 현재 프로젝트 규모에서는 마이그레이션과 API 변경 폭이 크다.
Phase 13 MVP에서는 과하므로 보류한다.

---

## 임포트 전략

1. eBible.org에서 `engwebp_vpl.zip`을 받는다.
2. 압축 파일과 출처 정보를 `docs/data-sources/` 또는 별도 문서에 기록한다.
3. VPL/SQL 구조를 확인한다.
4. 영어 책 식별자와 현재 한국어 `bookCode`를 매핑한다.
5. `WEBP` 본문을 다음 형태로 변환한다.

```json
{
  "창1:1": "In the beginning, God created the heavens and the earth.",
  "요1:1": "In the beginning was the Word, and the Word was with God, and the Word was God."
}
```

6. 변환 결과를 검증한다.
7. `public/bible-webp.json`으로 저장한다.

검증 항목은 다음과 같다.

- 66권만 포함되는가
- 현재 앱의 책 순서와 매핑되는가
- 각 책의 장 수가 현재 `BibleBook.chapterCount`와 맞는가
- 한국어 본문에는 있는데 WEBP에는 없는 절이 있는가
- WEBP에는 있는데 한국어 본문에는 없는 절이 있는가
- `verse_key` 중복이 없는가
- 본문에 footnote, heading, paragraph marker가 섞이지 않았는가

절 수가 100% 일치하지 않을 수 있으므로, 변환 스크립트는 실패/누락 리포트를 반드시 남긴다.
대조 역본이 없는 절은 화면에서 영어 문장을 숨기고 한국어 본문만 보여준다.

---

## 후속 API 방향

현재 성경 읽기 화면은 API를 사용하지 않으므로, Phase 13 MVP에서 아래 API 변경은 필수가 아니다.
다만 나중에 서버 기반 검색/관리/다중 역본 조회를 붙일 때를 위해 방향만 남긴다.

현재 백엔드 장 조회 API는 다음 형태다.

```text
GET /api/v1/bible/books/{bookCode}/chapters/{chapterNum}
```

후속 단계에서는 쿼리 파라미터로 역본을 지정한다.

```text
GET /api/v1/bible/books/{bookCode}/chapters/{chapterNum}?translation=KOR
GET /api/v1/bible/books/{bookCode}/chapters/{chapterNum}?translation=KOR&compare=WEBP
```

응답 초안은 다음과 같다.

```json
{
  "chapterNum": 1,
  "translation": "KOR",
  "compareTranslation": "WEBP",
  "verses": [
    {
      "verseNum": 1,
      "verseKey": "요1:1",
      "text": "[한국어 본문 예시 생략]",
      "compareText": "In the beginning was the Word..."
    }
  ]
}
```

후속 API에서도 대조 역본을 최대 1개부터 허용한다.
여러 역본 배열 응답은 나중에 확장한다.

---

## 프론트엔드 UX 방향

### 기본 원칙

- 기존 성경 읽기 화면을 유지한다.
- 역본 비교는 본문 탭 안의 표시 옵션이다.
- 사용자가 역본 기능을 몰라도 기존 읽기 경험은 변하지 않는다.
- 하이라이트/저장/공유의 기준은 계속 `verse_key`다.

### 하단 컨트롤 UI

초원은 본문 상단에 역본 배지를 둔다.
Beautiful Bible은 현재 읽기 화면의 하단에 `화면 모드`와 `글씨 크기` 컨트롤이 있으므로, 역본 비교 진입점도 이 근처에 둔다.

하단 컨트롤 예시는 다음과 같다.

```text
[화면 모드]     [역본 비교]     [작은 글]
```

버튼은 작은 아이콘+라벨 형태로 시작한다.
예시는 다음과 같다.

```text
아이콘: Languages 또는 BookOpenText
라벨: 역본
상태 표시: WEB 켜짐 / 대조 없음
```

버튼을 누르면 역본 선택 바텀시트를 연다.
상단 헤더에는 역본 배지를 추가하지 않는다.
이유는 현재 헤더가 책/장 이동과 통독 상태 표시 역할을 맡고 있고, 역본 비교는 읽기 보기 설정에 더 가깝기 때문이다.

MVP 선택지는 최소화한다.

```text
기본 역본
- 운영 한국어 본문

대조 역본
- 선택 안 함
- WEB
```

초원처럼 기본 역본 자체를 WEB로 바꾸는 기능은 MVP에서 제외한다.
MVP의 기본 정책은 다음과 같다.

```text
기본 역본: 운영 한국어 본문 고정
대조 역본: 선택 안 함 또는 WEB
```

기본 역본 변경까지 열면 본문 언어뿐 아니라 검색, 공유, 오늘의 말씀, 통독 읽기, 하이라이트 표시 기준까지 함께 재정의해야 한다.
Beautiful Bible의 현재 핵심 사용자는 한국 교회 교인이므로, 첫 단계에서는 한국어 본문을 중심으로 두고 WEB은 이해를 돕는 대조 본문으로 제공한다.

후속 단계에서는 기본 역본을 WEB로 바꾸는 옵션을 검토할 수 있다.
이 경우 다음 정책을 별도로 정해야 한다.

```text
- 기본 본문을 WEB로 볼 때 한국어를 대조 역본으로 둘 것인가
- 검색 대상은 현재 기본 역본만 볼 것인가, 모든 역본을 볼 것인가
- 공유/복사 시 어떤 역본을 기본으로 사용할 것인가
- 오늘의 말씀과 통독 읽기 화면의 기본 표시 언어를 어떻게 정할 것인가
```

향후 NIV, KJV, 새번역 등은 목록에 넣지 않는다.
저작권/데이터 확보가 확정된 역본만 추가한다.

### 본문 표시

대조 역본이 선택되면 각 절 아래에 영어 본문을 보여준다.

```text
1 [한국어 본문 예시 생략]

  In the beginning was the Word, and the Word was with God...
```

스타일 초안은 다음과 같다.

- 한국어: 기존 본문 스타일 유지
- 영어: 한국어보다 약간 작거나 같은 크기
- 색상: 파란색 계열 또는 보조 강조색
- 절 간 간격은 기존보다 약간 넓힌다.

영어가 너무 강하면 한국어 본문 집중도가 떨어질 수 있으므로, 첫 MVP에서는 채도를 낮춘 파란색을 사용한다.

### 선택/하이라이트 정책

MVP에서는 구절 선택 대상은 기존 절 단위로 유지한다.
영어 문장을 따로 선택하는 별도 액션은 만들지 않는다.

하이라이트, 저장, 노트는 모두 `verse_key` 기준이다.
따라서 `요1:1`을 하이라이트하면 한국어/영어 표시 여부와 관계없이 같은 절에 적용된다.

복사/공유는 MVP에서 기존 한국어 본문 중심으로 유지한다.
영어 포함 복사 옵션은 후속 기능으로 검토한다.

---

## 사용자 설정 저장

MVP에서는 로컬 저장을 우선한다.

```text
localStorage
- bible.baseTranslation = KOR
- bible.compareTranslation = WEBP | none
```

로그인 사용자 설정 API에 저장하는 것은 후속으로 미룬다.
이유는 역본 비교가 개인화 설정이긴 하지만, 먼저 실제 사용 여부를 확인하는 것이 중요하기 때문이다.

---

## 구현 이슈 분리안

Phase 13은 다음 순서로 나눈다.

### 1. Docs/AI: 기획 정리

- WEB 라이선스 확인
- 데이터 확보 경로 정리
- 데이터 모델/API/UX 방향 정리

### 2. BE: 다중 역본 데이터 모델

- MVP에서는 보류 가능
- `translation_code` 추가
- unique 제약 변경
- 기존 본문 `KOR` 마이그레이션
- 장 조회 API에 `translation`, `compare` 파라미터 추가

### 3. AI/FE: WEBP 데이터 변환

- `engwebp_vpl.zip` 다운로드
- VPL/SQL 구조 확인
- `verse_key -> text` 변환 스크립트 작성
- 검증 리포트 작성
- `public/bible-webp.json` 생성

### 4. FE: 역본 비교 UI

- 하단 컨트롤 영역에 역본 비교 버튼 추가
- 역본 선택 바텀시트
- 절 아래 대조 본문 표시
- 로컬 설정 저장

### 5. QA: 데이터/화면 검증

- 창세기 1장
- 시편 23편
- 요한복음 1장
- 요한복음 3장
- 로마서 8장
- 절 누락/중복 검증
- 모바일 화면 줄바꿈 검증

---

## MVP에서 제외

- NIV, KJV 등 추가 역본
- 영어 본문 검색
- 영어 포함 복사/공유 옵션
- 영어 하이라이트 별도 색상
- 사용자별 서버 설정 저장
- 여러 대조 역본 동시 표시
- 기본 역본을 WEB로 변경하는 옵션
- 역본별 폰트/문단 고급 설정
- 오프라인 번역본 캐싱 정책 고도화

---

## 리스크

### 절 번호 불일치

한국어 본문과 WEBP의 절 번호가 일부 다를 수 있다.
이 경우 억지로 맞추지 않고, 누락 리포트를 확인한 뒤 화면에서는 있는 본문만 보여준다.

### 상표

World English Bible 본문은 Public Domain이지만 명칭은 상표다.
본문을 변경하지 않고 충실한 사본으로 사용한다.
데이터 변환 과정에서 문장 자체를 수정하지 않는다.

### 정적 JSON 크기

영어 본문 JSON을 추가하면 프론트 정적 자산 크기가 증가한다.
현재 한국어 `bible.json`이 약 5MB이므로, WEBP JSON도 비슷한 크기가 될 수 있다.
초기 로딩, PWA 캐시, 모바일 네트워크 영향을 확인해야 한다.

### DB 마이그레이션

백엔드까지 확장할 경우 현재 `verse_key unique`를 복합 unique로 바꾸는 작업은 실제 DB에 영향을 준다.
Supabase에서 SQL을 실행하기 전 로컬/개발 DB에서 충분히 검증한다.

### 검색 결과 혼합

다중 역본이 같은 테이블에 들어가면 검색 API가 한국어/영어 본문을 동시에 검색할 수 있다.
MVP에서는 기존 검색은 한국어 본문만 대상으로 유지한다.

---

## 완료 기준

- WEBP가 Public Domain임을 공식 출처 기준으로 확인했다.
- 사용할 데이터 판본을 `engwebp`로 결정했다.
- 데이터 다운로드/변환/검증 흐름을 정리했다.
- 현재 `verse_key` 불변 규칙을 유지하는 정적 JSON 추가 방향을 정리했다.
- 백엔드 다중 역본 확장 방향과 후속 API 초안을 정리했다.
- 초원 참고 화면을 바탕으로 한 역본 비교 UX 방향을 정리했다.
- 우리 앱의 하단 읽기 컨트롤에 맞춘 역본 비교 진입점을 정리했다.
- 기본 역본 변경은 MVP에서 제외하고 후속 확장으로 분리했다.
- 구현을 WEBP 변환, FE UI, BE 후속 확장, QA 이슈로 분리했다.
