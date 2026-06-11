# 112. 인물 해설 MVP 대상과 추가 샘플 콘텐츠

## 배경

아브라함 1명 샘플로 인물 해설 화면과 데이터 구조를 먼저 확인했다. 이번 작업은 같은 구조가 다른 인물에게도 자연스럽게 적용되는지 보기 위해 MVP 대상 인물과 추가 샘플 콘텐츠를 정리한다.

인물 해설은 설교 적용이나 교리 단정을 앞세우지 않고, 사용자가 본문을 읽을 때 인물의 이야기 흐름과 관련 구절을 더 쉽게 잡도록 돕는 보조 콘텐츠로 둔다.

## MVP 인물 선정 기준

MVP 대상은 다음 기준으로 고른다.

- 성경 전체 흐름을 이해하는 데 자주 등장하는 인물
- 관련 본문이 충분해 `storyFlow`를 3~5개로 나눌 수 있는 인물
- 초교파적으로 큰 논쟁 없이 본문 중심 설명이 가능한 인물
- 구약과 신약의 균형을 어느 정도 보여 줄 수 있는 인물
- 이후 이미지 생성 시 직접 초상 또는 상징 이미지로 표현하기에 무리가 적은 인물

예수님은 MVP 인물 해설에서 제외한다. 예수님은 단순한 “성경 인물” 항목보다 별도 그리스도 해설 또는 복음서 중심 해설로 다루는 편이 적절하다. 하나님, 성령도 직접 이미지 생성 대상에 포함하지 않는다.

## 1차 MVP 대상 16명

| 순서 | personCode | 이름 | 우선 이유 |
| --- | --- | --- | --- |
| 1 | `abraham` | 아브라함 | 언약, 믿음, 창세기 흐름의 핵심 |
| 2 | `moses` | 모세 | 출애굽, 율법, 광야 이야기의 중심 |
| 3 | `david` | 다윗 | 왕정, 시편, 메시아 계보 이해에 중요 |
| 4 | `mary` | 마리아 | 복음서 시작과 예수 탄생 이야기 이해에 중요 |
| 5 | `paul` | 바울 | 사도행전과 서신서 이해의 중심 |
| 6 | `peter` | 베드로 | 복음서와 초대교회 흐름 연결 |
| 7 | `joseph` | 요셉 | 창세기 후반과 구원 보존 이야기의 중심 |
| 8 | `jacob` | 야곱 | 이스라엘 이름과 열두 지파 흐름 이해 |
| 9 | `noah` | 노아 | 홍수 이야기와 언약 흐름의 출발점 |
| 10 | `sarah` | 사라 | 약속의 후손 이야기에서 중요한 인물 |
| 11 | `joshua` | 여호수아 | 가나안 입성과 리더십 전환 이해 |
| 12 | `solomon` | 솔로몬 | 지혜, 성전, 왕국 분열 배경 이해 |
| 13 | `elijah` | 엘리야 | 예언자 전통과 북이스라엘 배경 이해 |
| 14 | `daniel` | 다니엘 | 포로기 신앙과 묵시 문학 배경 이해 |
| 15 | `john-baptist` | 세례 요한 | 구약 예언과 복음서 시작 연결 |
| 16 | `timothy` | 디모데 | 바울의 동역과 목회서신 이해 |

2차 후보는 하와, 이삭, 리브가, 라헬, 룻, 사무엘, 사울, 에스더, 느헤미야, 이사야, 예레미야, 막달라 마리아, 요한, 야고보로 둔다.

## 데이터 길이 기준

- `shortDescription`: 한 줄. 30~45자 정도.
- `description`: 4~6문장. 화면에서 한 덩어리로 읽히도록 너무 길게 쓰지 않는다.
- `storyFlow`: 최소 3개, 최대 5개, 기본 4개.
- `storyFlow.summary`: 각 단계당 1문장.
- `keyVerses`: 3~5개. 화면에서는 구절 버튼만 보여 주고, `label`은 접근성 또는 검수용으로 활용한다.
- `relatedBooks`: 2~5개. 데이터는 책 코드로 저장하고 화면에서는 책 이름으로 표시한다.
- `keywords`: 4~6개.

## 추가 샘플: 모세

```json
{
  "personCode": "moses",
  "name": "모세",
  "shortDescription": "출애굽과 광야 여정을 이끈 하나님의 종",
  "description": "모세는 출애굽기에서 이스라엘을 애굽의 억압에서 이끌어 내는 중심 인물로 등장한다. 그의 이야기는 하나님의 부르심, 바로와의 대면, 홍해를 건너는 구원, 시내산 언약과 광야 여정으로 이어진다. 모세는 강한 지도자로만 그려지지 않고, 두려움과 망설임을 가진 사람으로도 나타난다. 성경은 모세를 통해 하나님이 한 사람을 부르시고 공동체를 이끄시는 과정을 보여 준다.",
  "storyFlow": [
    {
      "title": "부르심",
      "summary": "하나님은 떨기나무 가운데서 모세를 부르시고 이스라엘을 애굽에서 이끌어 내라고 하신다.",
      "verseKeys": ["출3:10"]
    },
    {
      "title": "출애굽",
      "summary": "모세는 바로 앞에 서고, 이스라엘은 하나님의 구원으로 애굽을 떠난다.",
      "verseKeys": ["출12:31", "출14:13"]
    },
    {
      "title": "언약",
      "summary": "시내산에서 모세는 율법을 받고 이스라엘이 언약 백성으로 살아갈 길을 전한다.",
      "verseKeys": ["출19:5", "출20:1"]
    },
    {
      "title": "광야",
      "summary": "광야 여정에서 모세는 백성의 불평과 연약함 속에서도 하나님 앞에 서는 중재자로 나타난다.",
      "verseKeys": ["민14:19", "신34:10"]
    }
  ],
  "keyVerses": [
    { "verseKey": "출3:10", "label": "부르심" },
    { "verseKey": "출14:13", "label": "홍해 앞에서" },
    { "verseKey": "출20:1", "label": "율법" },
    { "verseKey": "신34:10", "label": "모세의 평가" }
  ],
  "relatedBooks": ["출", "레", "민", "신"],
  "keywords": ["출애굽", "부르심", "율법", "언약", "광야"]
}
```

이미지 방향: 광야 또는 시내산 배경의 고대 근동 남성 지도자. 돌판을 과하게 강조하거나 초자연적 장면을 직접 묘사하지 않는다.

## 추가 샘플: 다윗

```json
{
  "personCode": "david",
  "name": "다윗",
  "shortDescription": "목동에서 왕이 된 이스라엘의 대표적인 왕",
  "description": "다윗은 사무엘상과 사무엘하에서 목동으로 시작해 이스라엘의 왕이 되는 인물이다. 그는 골리앗과의 싸움, 사울에게 쫓기는 시간, 왕으로 세워지는 과정 속에서 하나님을 의지하는 모습으로 기억된다. 동시에 성경은 다윗의 실패와 죄도 숨기지 않고 기록한다. 다윗의 이야기는 왕권, 회개, 언약, 시편의 배경을 이해하는 데 중요한 길잡이가 된다.",
  "storyFlow": [
    {
      "title": "기름부음",
      "summary": "사무엘은 이새의 아들들 가운데 다윗에게 기름을 부어 왕으로 세워질 사람임을 드러낸다.",
      "verseKeys": ["삼상16:13"]
    },
    {
      "title": "골리앗",
      "summary": "다윗은 골리앗 앞에서 전쟁이 하나님께 속했다는 고백을 드러낸다.",
      "verseKeys": ["삼상17:45", "삼상17:47"]
    },
    {
      "title": "왕위",
      "summary": "오랜 도피와 기다림 뒤에 다윗은 이스라엘의 왕으로 세워진다.",
      "verseKeys": ["삼하5:3"]
    },
    {
      "title": "언약과 회개",
      "summary": "다윗의 삶은 하나님의 언약과 인간의 실패, 그리고 회개의 이야기를 함께 보여 준다.",
      "verseKeys": ["삼하7:16", "시51:10"]
    }
  ],
  "keyVerses": [
    { "verseKey": "삼상16:13", "label": "기름부음" },
    { "verseKey": "삼상17:47", "label": "골리앗 앞에서" },
    { "verseKey": "삼하7:16", "label": "다윗 언약" },
    { "verseKey": "시51:10", "label": "회개" }
  ],
  "relatedBooks": ["삼상", "삼하", "시"],
  "keywords": ["왕", "목동", "믿음", "언약", "회개"]
}
```

이미지 방향: 왕관이나 전투 장면보다 목동 또는 조용한 왕의 분위기를 우선한다. 골리앗 장면을 쓰더라도 폭력적 표현은 피한다.

## 추가 샘플: 마리아

```json
{
  "personCode": "mary",
  "name": "마리아",
  "shortDescription": "예수님의 탄생 이야기에서 순종으로 응답한 여인",
  "description": "마리아는 복음서에서 예수님의 탄생 이야기와 함께 등장하는 중요한 인물이다. 누가복음은 마리아가 천사의 소식을 듣고 놀라지만, 하나님의 말씀에 자신을 맡기는 응답을 보여 준다. 마리아의 이야기는 예수님의 탄생과 어린 시절, 십자가 곁의 장면까지 이어진다. 성경은 마리아를 과장된 상징으로만 다루기보다, 하나님의 말씀 앞에 서 있던 한 사람으로 보여 준다.",
  "storyFlow": [
    {
      "title": "수태고지",
      "summary": "마리아는 천사를 통해 예수님의 탄생 소식을 듣고 하나님의 말씀에 응답한다.",
      "verseKeys": ["눅1:30", "눅1:38"]
    },
    {
      "title": "찬가",
      "summary": "마리아는 하나님이 낮은 자를 돌보시는 분임을 노래한다.",
      "verseKeys": ["눅1:46", "눅1:52"]
    },
    {
      "title": "탄생",
      "summary": "예수님의 탄생 장면에서 마리아는 일어난 일을 마음에 새기며 생각한다.",
      "verseKeys": ["눅2:19"]
    },
    {
      "title": "십자가 곁",
      "summary": "요한복음은 예수님의 십자가 곁에 서 있던 마리아의 모습을 전한다.",
      "verseKeys": ["요19:25"]
    }
  ],
  "keyVerses": [
    { "verseKey": "눅1:38", "label": "응답" },
    { "verseKey": "눅1:46", "label": "찬가" },
    { "verseKey": "눅2:19", "label": "마음에 새김" },
    { "verseKey": "요19:25", "label": "십자가 곁" }
  ],
  "relatedBooks": ["마", "눅", "요", "행"],
  "keywords": ["순종", "탄생", "겸손", "기억", "복음서"]
}
```

이미지 방향: 아기 예수나 천사를 직접 크게 묘사하기보다, 고대 유대 여성의 차분한 초상 또는 나사렛 배경의 상징적 장면을 사용한다. 교리적 논쟁으로 보일 수 있는 과장된 성상 표현은 피한다.

## 검토 메모

세 샘플 모두 기존 필드 구조 안에 들어간다. 다만 인물마다 `relatedBooks` 성격이 조금 다르다. 모세는 오경 중심, 다윗은 역사서와 시편 중심, 마리아는 복음서와 사도행전 중심이다. 따라서 BE 저장 구조에서도 `relatedBooks`는 별도 설명 없이 책 코드 배열로 유지하고, 화면에서 책 이름으로 바꾸는 방식이 적절하다.

`storyFlow`는 4개가 가장 안정적이다. 3개는 짧은 인물에게 적합하고, 5개는 바울처럼 본문 범위가 넓은 인물에게만 사용하는 편이 좋다.

## BE 저장 구조 초안

인물 해설은 실시간 AI 호출 결과가 아니라 사전 생성/검수된 콘텐츠다. 따라서 MVP에서는 조회 전용 테이블 하나로 시작하는 것이 적절하다.

테이블 이름은 `person_commentaries`를 제안한다.

```sql
person_commentaries
- id BIGSERIAL PRIMARY KEY
- person_code VARCHAR(80) UNIQUE NOT NULL
- name VARCHAR(80) NOT NULL
- short_description VARCHAR(255) NOT NULL
- description TEXT NOT NULL
- story_flow JSONB NOT NULL
- key_verses JSONB NOT NULL
- related_books JSONB NOT NULL
- keywords JSONB NOT NULL
- status VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
- created_at TIMESTAMP NOT NULL
- updated_at TIMESTAMP NOT NULL
```

`story_flow`, `key_verses`, `related_books`, `keywords`는 MVP에서 별도 테이블로 쪼개지 않는다. 현재 목적은 검색/통계보다 정적 해설 조회이고, FE도 배열 형태로 바로 소비하기 때문이다. PostgreSQL을 쓰므로 문자열 JSON보다 `jsonb`가 더 자연스럽다.

`image_url`은 넣지 않는다. 이미지는 FE public 파일 규칙을 따른다.

```text
/images/persons/{personCode}.webp
```

운영 상태는 `status`로 관리한다.

- `DRAFT`: 작성 또는 검수 중
- `APPROVED`: 사용자에게 노출 가능

MVP 조회 API는 `APPROVED`만 반환한다. 관리자 작성/수정 API는 이번 범위에 넣지 않고, 초기 데이터는 SQL upsert 또는 수동 seed로 관리한다.

## BE 패키지와 API 초안

백엔드는 기존 규칙처럼 도메인 패키징을 유지한다. 루트에 controller/service/repository를 나열하지 않는다.

```text
com.bb.bible.domain.commentary
```

예상 구성:

```text
domain/commentary/
- PersonCommentary.java
- PersonCommentaryRepository.java
- PersonCommentaryService.java
- PersonCommentaryController.java
- dto/
  - PersonCommentaryListItemResponse.java
  - PersonCommentaryDetailResponse.java
```

API는 공개 조회로 시작한다.

```http
GET /api/v1/commentaries/persons
GET /api/v1/commentaries/persons/{personCode}
```

목록 응답은 가볍게 둔다.

```json
{
  "personCode": "abraham",
  "name": "아브라함",
  "shortDescription": "하나님의 약속을 따라 길을 떠난 믿음의 조상",
  "keywords": ["믿음", "언약", "약속"]
}
```

상세 응답은 현재 FE 정적 데이터와 같은 구조를 유지한다.

```json
{
  "personCode": "abraham",
  "name": "아브라함",
  "shortDescription": "...",
  "description": "...",
  "storyFlow": [],
  "keyVerses": [],
  "relatedBooks": [],
  "keywords": []
}
```

없는 `personCode`는 404로 응답한다. 아직 인증과 사용자 데이터가 필요 없는 공개 콘텐츠이므로 JWT 인증은 붙이지 않는다.

## FE 전환 흐름

현재 FE는 `src/data/person-commentaries.ts`의 정적 데이터를 사용한다. BE API가 준비되면 다음 순서로 전환한다.

1. `fetchPersonCommentaries()`와 `fetchPersonCommentary(personCode)`를 `lib/api.ts`에 추가한다.
2. 목록 화면은 `GET /api/v1/commentaries/persons`를 호출한다.
3. 상세 화면은 `GET /api/v1/commentaries/persons/{personCode}`를 호출한다.
4. 이미지 경로는 계속 FE에서 `personCode` 기반으로 계산한다.
5. API 실패 또는 404일 때는 현재 정적 화면의 empty/error 상태를 재사용한다.

이 전환 전까지 FE 정적 데이터에 16명 전체를 넣을 필요는 낮다. 아브라함 1명으로 화면 구조를 확인했고, 모세/다윗/마리아 샘플로 데이터 구조도 검증했기 때문이다. 이후 실제 콘텐츠 확장은 DB seed 또는 upsert 데이터로 관리하는 편이 중복 작업을 줄인다.

## 다음 단계

1. 사용자 검수 후 MVP 16명 목록을 확정한다.
2. BE 작업에서 `person_commentaries` 테이블과 조회 API를 사용자가 직접 구현한다.
3. AI는 BE 구현 과정에서 개념 설명, 단계 안내, 최소 스니펫, 리뷰 위주로 돕는다.
4. BE API가 준비되면 FE 정적 데이터를 API 조회로 전환한다.
5. 이미지가 준비되는 인물부터 `public/images/persons/{personCode}.webp`로 넣는다.
