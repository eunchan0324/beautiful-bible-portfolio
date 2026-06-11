# BB (Beautiful Bible) 디자인 스펙

## 📋 디자인 시스템

### 🎨 컬러 팔레트
```css
/* Primary Colors */
--primary-50: #fff7ed;
--primary-100: #ffedd5;
--primary-200: #fed7aa;
--primary-300: #fdba74;
--primary-400: #fb923c;
--primary-500: #f97316;  /* 메인 오렌지 */
--primary-600: #ea580c;
--primary-700: #c2410c;
--primary-800: #9a3412;
--primary-900: #7c2d12;

/* Gray Scale */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;

/* Semantic Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;

/* Background */
--bg-primary: #ffffff;
--bg-secondary: #f9fafb;
--bg-tertiary: #f3f4f6;
```

### 📝 타이포그래피
```css
/* Font Family */
--font-primary: "Pretendard", -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: "SF Mono", Consolas, monospace;

/* Font Sizes */
--text-xs: 12px;    /* 0.75rem */
--text-sm: 14px;    /* 0.875rem */
--text-base: 16px;  /* 1rem */
--text-lg: 18px;    /* 1.125rem */
--text-xl: 20px;    /* 1.25rem */
--text-2xl: 24px;   /* 1.5rem */
--text-3xl: 30px;   /* 1.875rem */
--text-4xl: 36px;   /* 2.25rem */

/* Font Weights */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
```

### 📏 간격 시스템 (8px Grid)
```css
/* Spacing Scale */
--space-1: 4px;     /* 0.25rem */
--space-2: 8px;     /* 0.5rem */
--space-3: 12px;    /* 0.75rem */
--space-4: 16px;    /* 1rem */
--space-5: 20px;    /* 1.25rem */
--space-6: 24px;    /* 1.5rem */
--space-8: 32px;    /* 2rem */
--space-10: 40px;   /* 2.5rem */
--space-12: 48px;   /* 3rem */
--space-16: 64px;   /* 4rem */
--space-20: 80px;   /* 5rem */

/* Specific Usage */
--padding-sm: var(--space-3);
--padding-md: var(--space-4);
--padding-lg: var(--space-6);
--margin-sm: var(--space-2);
--margin-md: var(--space-4);
--margin-lg: var(--space-8);
```

### 🔵 Border Radius
```css
--radius-none: 0;
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

### 🌫️ 그림자
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

---

## 📱 화면별 디자인 스펙

### 🏠 메인 화면 (Home)
```
현재 상태: 디자인 스펙 확정
업데이트 필요 사항:
- [x] 배경색 적용
- [x] 텍스트 색상 및 스타일링 
- [x] 폰트 설정
- [x] 바텀 네비게이션 색상
- [ ] 로고 디자인 최신화 (제작중)
```

**디자이너 제공 스펙:**
- 배경색: #F0EEE7
- 로고: 현재 BB 로고 임시 사용 (제작중)
- 메인 텍스트: "하루를 기록하는 가장 간단한 간단한 방법 간단한"
- 텍스트 색상: #414141
- 텍스트 폰트: Pretendard, semiBold, 18px
- 바텀 아이콘 활성화: #8D8881
- 바텀 아이콘 비활성화: #D2CFC8  
- 바텀 텍스트 색상: #343434

### 📖 성경 목록 화면 (Bible List)
```
현재 상태: 브레드크럼 디자인 적용 중
업데이트 필요 사항:
- [x] 브레드크럼 스타일링
- [ ] 드롭다운 디자인 개선
- [ ] 책 버튼 스타일링
- [ ] 간격 조정
```

**디자이너 제공 스펙:**
- 브레드크럼 폰트: Pretendard, semiBold, 18px
- 브레드크럼 활성화 글씨: #55524F
- 브레드크럼 비활성화 글씨: #D2CFC8
- 브레드크럼 활성 하단바: #8D8881
- 브레드크럼 비활성 하단바: #D2CFC8

**드롭다운 스펙:**
- 크기: 73×36px (반응형)
- 배경: #FFFFFF (80% 투명도, blur 효과)
- 텍스트: Pretendard, Bold, 14px
- 구약 텍스트: #3F74AB
- 신약 텍스트: #8C4643
- 아이콘: 14×14px, #414141
- 활성화 시 텍스트: #414141
- 활성화 시 배경: #FFFFFF (80%)
- 구분선: #D9D9D9 (80%)

**책 버튼 스펙:**
- 크기: 153×50px (세로 수정됨)
- 배경색: #FFFFFF
- 내부 동그라미: 30×30px, x10, y중앙
  - 구약: #CCE5FF (연한 파란색)
  - 신약: #FFD8D6 (연한 핑크색)
- 동그라미 텍스트: Pretendard, Regular, 14px, #414141, 중앙
- 책 이름: x45 (5px 간격), Pretendard, semiBold, 14px

### 📑 장 선택 화면 (Chapter Selection)

**장 버튼 스펙:**
- 크기: 58×40px (반응형)
- 배경색: #FFFFFF
- 모서리: 6px 둥글게 (rounded-md)
- 버튼 간격: 10px
- 상단 여백: 30px (텍스트와의 간격)
- 텍스트: Glory, semiBold, 18px, #414141, 중앙정렬
- 5열 그리드 레이아웃

**선택 상태 텍스트 스펙:**
- 색상: #8D8881
- 폰트: Pretendard, semiBold, 14px

```
현재 상태: 구현 완료 ✅
업데이트 필요 사항:
- [ ] 그리드 레이아웃 최적화
- [ ] 버튼 디자인 개선
- [ ] 브레드크럼 스타일링
```

**디자이너 제공 스펙:**
- 그리드 간격: [px 값]
- 버튼 크기: [width x height]
- 활성/비활성 상태 색상: [색상 코드들]
- 브레드크럼 폰트 크기: [px 값]

### 📝 절 선택 화면 (Verse Selection)

**절 버튼 스펙:** (장 선택과 동일)
- 크기: 58×40px (반응형)
- 배경색: #FFFFFF
- 모서리: 6px 둥글게 (rounded-md)
- 버튼 간격: 10px
- 상단 여백: 30px (텍스트와의 간격)
- 텍스트: Glory, semiBold, 18px, #414141, 중앙정렬
- 5열 그리드 레이아웃

**선택 상태 텍스트 스펙:**
- 색상: #8D8881
- 폰트: Pretendard, semiBold, 14px

```
현재 상태: 구현 완료 ✅
업데이트 필요 사항:
- [x] 그리드 레이아웃 최적화
- [x] 버튼 디자인 통일
```

### 📖 구절 읽기 화면 (Verse Reading)

**구절 읽기 화면 스펙:**
- 배경색: #FFFFFF (흰색)
- 상단 여백: 193px (StickyHeader 높이 64px + 텍스트와의 간격 60px + safe-area 69px)
- 좌우 여백: 30px

**StickyHeader 스펙:**
- 텍스트: Pretendard, semiBold, 22px, #414141
- 아이콘: w-6 h-6 (24px) - 22px 텍스트에 맞는 크기
- 위치: top-[65px] (safe-area 고려)
- 배경: 흰색, 하단 보더

**폰트 크기 드롭다운 스펙:**
- 버튼 크기: 73×36px
- 버튼 배경: #F0EEE7
- 텍스트: Pretendard, Bold, 14px, #414141
- 아이콘: 14px (w-3.5 h-3.5)
- 드롭다운 배경: rgba(240, 238, 231, 0.8) + blur 효과
- 드롭다운 텍스트: Pretendard, Medium, 14px, #414141
- 구분선: rgba(217, 217, 217, 0.8) (여백 없이 전체 너비)
- 쉐도우: 없음
- 클릭 기능: 드롭다운 열기/닫기

```
현재 상태: 디자인 업데이트 중 🔄
업데이트 필요 사항:
- [x] Sticky Header 텍스트 디자인
- [x] 아이콘 크기 조정
- [x] 폰트 크기 드롭다운 디자인
- [ ] 구절 텍스트 스타일링
- [ ] 하이라이팅 색상 조정
```

**디자이너 제공 스펙:**
- Sticky Header 배경: [색상 코드]
- 폰트 크기 버튼: [스타일 설명]
- 구절 번호 색상: [색상 코드]
- 구절 텍스트 색상: [색상 코드]
- 하이라이팅 색상: [색상 코드들]

---

## 🔧 컴포넌트 상태 스펙

### 버튼 상태
```css
/* Primary Button */
.btn-primary {
  background: [기본 색상];
  color: [텍스트 색상];
}

.btn-primary:hover {
  background: [호버 색상];
}

.btn-primary:active {
  background: [클릭 색상];
}

.btn-primary:disabled {
  background: [비활성 색상];
  color: [비활성 텍스트 색상];
}
```

### 입력 필드 상태
```css
/* Input Field */
.input {
  border: [기본 테두리];
  background: [배경색];
}

.input:focus {
  border: [포커스 테두리];
  box-shadow: [포커스 그림자];
}

.input:error {
  border: [에러 테두리];
}
```

---

## 📐 반응형 브레이크포인트
```css
/* Mobile First */
--mobile: 375px;
--tablet: 768px;
--desktop: 1024px;
--large: 1280px;

/* Usage */
@media (min-width: 768px) {
  /* Tablet+ styles */
}

@media (min-width: 1024px) {
  /* Desktop+ styles */
}
```

---

## 🎨 다크모드 (필요시)
```css
/* Dark Mode Colors */
@media (prefers-color-scheme: dark) {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
}
```

---

## 📋 구현 체크리스트

### Phase 1: 기본 스타일링
- [ ] CSS 변수 설정
- [ ] 전역 스타일 적용
- [ ] 컴포넌트별 기본 스타일

### Phase 2: 상세 스타일링
- [ ] 메인 화면 디자인 적용
- [ ] 성경 목록 화면 스타일링
- [ ] 장/절 선택 화면 개선

### Phase 3: 인터랙션
- [ ] 호버/클릭 상태 적용
- [ ] 애니메이션 추가
- [ ] 반응형 최적화

### Phase 4: 마무리
- [ ] 다크모드 (선택사항)
- [ ] 접근성 개선
- [ ] 성능 최적화

---

## 🚧 알려진 이슈 및 추후 개발 항목

### PWA 제스처 제한
- **상태**: 미해결 (추후 개발)
- **문제**: PWA 모드에서 스와이프 제스처(뒤로가기/앞으로가기)가 완전히 제한되지 않음
- **시도한 방법**:
  - `overscrollBehavior: 'none'`
  - `touchAction: 'pan-y'`
  - `WebkitTouchCallout: 'none'`
  - manifest.json `display_override` 설정
- **원인**: 브라우저/OS 레벨 제스처는 웹 API로 완전히 제어 불가능
- **대안**: 
  1. 네이티브 앱 래퍼 사용 (React Native, Capacitor 등)
  2. 사용자 교육/가이드 제공
  3. 브라우저 업데이트 대기

### 반응형 레이아웃
- **상태**: 375px 기준으로 고정 설계
- **이슈**: 더 큰 화면에서 버튼이 왼쪽으로 쏠림
- **해결 중**: 동적 그리드 시스템 적용 예정

## 💾 로컬 스토리지 사용 항목
```typescript
// 사용자 설정 저장
localStorage.setItem('bb-bible-font-size', 'small' | 'large')
localStorage.setItem('bb-bible-testament', 'old' | 'new')
```

## 🎯 성능 최적화 적용 사항
- 구절 파싱 정규식 최적화
- 데이터 로딩 중복 방지 (Zustand store)
- 절 개수 동적 계산 (실제 데이터 기반)

## 📝 업데이트 로그
```
2025-10-02: 초기 스펙 문서 생성
2025-10-02: PWA 제스처 제한 이슈 문서화
2025-10-02: 로컬 스토리지 설정 항목 추가
2025-10-02: 반응형 레이아웃 이슈 확인
```
