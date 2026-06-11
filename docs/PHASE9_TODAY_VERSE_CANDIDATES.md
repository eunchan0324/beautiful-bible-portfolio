# Phase 9: 오늘의 말씀 후보 선정 기준

> Issue: #132
> Phase 9 PWA 오늘의 말씀 알림의 선행 문서.
> 홈 화면과 알림에서 사용할 "오늘의 말씀" 후보군을 큐레이션한다.

---

## 배경

오늘의 말씀은 홈 화면과 PWA 알림의 공통 콘텐츠가 된다.

성경 전체 31,089개 구절에서 임의로 하나를 고르면 다음 문제가 생긴다.

- 족보, 숫자, 지명 나열처럼 단독 알림에 적합하지 않은 구절이 섞일 수 있다.
- 심판, 전쟁, 저주, 특정 사건 설명처럼 문맥 없이 보면 오해될 수 있는 구절이 섞일 수 있다.
- 너무 긴 구절이나 앞뒤 문맥이 필요한 구절은 홈 카드/알림에 어울리지 않는다.

따라서 오늘의 말씀은 전체 랜덤이 아니라, 먼저 큐레이션한 후보 목록에서 날짜 기준으로 선택한다.

---

## 외부 서비스 조사 요약

- YouVersion은 Verse of the Day를 스태프가 고른다고 설명한다. 기준은 격려, 영감, 도전이 되는 구절이다.
- Bible Notify는 150개 이상의 영감을 주는 구절 후보에서 매일 랜덤 알림을 보낸다.
- Word of Light는 curated daily verses와 묵상/reflection을 함께 제공한다.
- Bible Gateway도 Verse of the Day를 daily inspirational and encouraging verse로 소개한다.

결론:

```text
일반적인 오늘의 말씀 서비스는 전체 성경 랜덤보다 큐레이션 후보군을 선호한다.
```

참고:

- https://help.youversion.com/l/en/article/iw3ms7k1w1-votd-bl
- https://biblenotify.github.io/
- https://evangelux.com/en
- https://www.biblegateway.com/reading-plans/verse-of-the-day/today

---

## 선정 기준

포함한다.

- 한두 절만 봐도 의미가 비교적 분명한 구절
- 아침 알림으로 받아도 부담이 적은 구절
- 위로, 평안, 소망, 감사, 믿음, 기도, 사랑, 순종, 공동체, 복음 같은 주제에 맞는 구절
- 홈 카드와 모바일 알림에 들어갈 수 있는 짧거나 중간 길이의 구절
- 교회 어른 사용자도 바로 이해하기 쉬운 구절

제외한다.

- 족보, 지명, 숫자 나열
- 전쟁, 저주, 심판 구절 중 문맥 없이 강하게 느껴지는 구절
- 한 절만 보면 의미가 끊기는 구절
- 너무 긴 구절
- 특정 논쟁 문맥에 강하게 묶여 있는 구절

---

## 데이터 형태 제안

BE seed 또는 정적 seed로 옮길 때 다음 형태를 기준으로 한다.

```ts
{
  verseKey: '시23:1',
  theme: 'comfort',
  sortOrder: 1,
}
```

필드 의미:

- `verseKey`: 반드시 `시23:1` 형식. 레이어 간 변환 금지.
- `theme`: 주제 그룹. API 필터나 운영 분석에 사용 가능.
- `sortOrder`: seed 정렬과 수동 관리용.

---

## 1차 후보 목록

### 위로와 평안

| verse_key | theme |
| --- | --- |
| 시23:1 | comfort |
| 시23:4 | comfort |
| 시27:1 | comfort |
| 시34:18 | comfort |
| 시46:1 | comfort |
| 시55:22 | comfort |
| 시94:19 | comfort |
| 사41:10 | comfort |
| 요14:27 | comfort |
| 빌4:6 | comfort |
| 빌4:7 | comfort |
| 벧전5:7 | comfort |

### 소망과 인내

| verse_key | theme |
| --- | --- |
| 렘29:11 | hope |
| 사40:31 | hope |
| 롬5:3 | hope |
| 롬5:4 | hope |
| 롬8:18 | hope |
| 롬8:28 | hope |
| 롬15:13 | hope |
| 고후4:16 | hope |
| 고후4:17 | hope |
| 히10:23 | hope |
| 히12:1 | hope |
| 약1:2 | hope |

### 믿음과 신뢰

| verse_key | theme |
| --- | --- |
| 잠3:5 | faith |
| 잠3:6 | faith |
| 히11:1 | faith |
| 히11:6 | faith |
| 고후5:7 | faith |
| 마6:33 | faith |
| 시37:5 | faith |
| 시62:8 | faith |
| 요20:29 | faith |
| 롬10:17 | faith |

### 감사와 기쁨

| verse_key | theme |
| --- | --- |
| 시100:4 | gratitude |
| 시118:24 | gratitude |
| 살전5:16 | gratitude |
| 살전5:17 | gratitude |
| 살전5:18 | gratitude |
| 빌4:4 | gratitude |
| 골3:15 | gratitude |
| 골3:16 | gratitude |
| 골3:17 | gratitude |
| 약1:17 | gratitude |

### 사랑과 용서

| verse_key | theme |
| --- | --- |
| 요3:16 | love |
| 요13:34 | love |
| 요13:35 | love |
| 롬5:8 | love |
| 롬12:10 | love |
| 고전13:4 | love |
| 고전13:7 | love |
| 엡4:32 | love |
| 요일4:7 | love |
| 요일4:18 | love |

### 기도와 말씀

| verse_key | theme |
| --- | --- |
| 시119:105 | prayer_word |
| 시119:11 | prayer_word |
| 시1:2 | prayer_word |
| 마7:7 | prayer_word |
| 마7:8 | prayer_word |
| 눅11:9 | prayer_word |
| 요15:7 | prayer_word |
| 약5:16 | prayer_word |
| 딤후3:16 | prayer_word |
| 딤후3:17 | prayer_word |

### 순종과 삶

| verse_key | theme |
| --- | --- |
| 미6:8 | life |
| 마5:16 | life |
| 마22:37 | life |
| 마22:39 | life |
| 롬12:1 | life |
| 롬12:2 | life |
| 갈5:22 | life |
| 갈5:23 | life |
| 엡2:10 | life |
| 골3:23 | life |

### 공동체와 섬김

| verse_key | theme |
| --- | --- |
| 히10:24 | community |
| 히10:25 | community |
| 갈6:2 | community |
| 엡4:2 | community |
| 엡4:3 | community |
| 빌2:3 | community |
| 빌2:4 | community |
| 벧전4:10 | community |
| 고전12:27 | community |
| 롬12:15 | community |

### 복음과 구원

| verse_key | theme |
| --- | --- |
| 요1:14 | gospel |
| 요10:10 | gospel |
| 요11:25 | gospel |
| 요14:6 | gospel |
| 행4:12 | gospel |
| 롬1:16 | gospel |
| 롬6:23 | gospel |
| 롬10:9 | gospel |
| 엡2:8 | gospel |
| 엡2:9 | gospel |

### 새 힘과 지혜

| verse_key | theme |
| --- | --- |
| 수1:9 | wisdom_strength |
| 시19:14 | wisdom_strength |
| 시139:23 | wisdom_strength |
| 시139:24 | wisdom_strength |
| 잠16:3 | wisdom_strength |
| 잠16:9 | wisdom_strength |
| 사43:19 | wisdom_strength |
| 애3:22 | wisdom_strength |
| 애3:23 | wisdom_strength |
| 마28:20 | wisdom_strength |

---

## 운영 결정

MVP에서는 다음 방식을 권장한다.

```text
후보 목록을 `sort_order` 순서로 정렬
-> 기준 날짜와 후보 수로 index 계산
-> 오늘의 말씀 1개 반환
```

예상 선택 로직:

```text
index = daysSinceEpoch % candidateCount
```

장점:

- 같은 날짜에는 모든 사용자에게 같은 말씀이 보인다.
- 별도 daily 테이블 없이도 동작한다.
- 후보 목록만 늘리면 반복 주기가 자연스럽게 길어진다.

단점:

- 특정 절기나 교회 상황에 맞춘 수동 지정은 어렵다.

수동 지정이 필요해지면 이후 다음 테이블을 추가한다.

```text
votd_daily
- date
- verse_key
- title
- message
```

---

## 다음 작업 연결

이 문서가 검수되면 다음 순서로 진행한다.

1. `today_verse_candidates` 테이블 설계
2. 후보 목록 seed 작성
3. `GET /api/v1/today-verse` 구현
4. 홈 오늘의 말씀 API 연동
5. PWA 오늘의 말씀 알림 구현
