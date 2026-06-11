# #164-168 개인 통독 백엔드 MVP

## 배경

Phase 10 개인 통독 MVP는 사용자가 읽을 책과 하루 목표 장 수를 정하고, 장 단위로 읽음 완료를 저장하는 기능이다.
단체 통독은 무료 서버 운영 부담과 실제 수요 검증 전이라는 이유로 제외하고, 먼저 개인 통독 데이터를 안정적으로 저장할 수 있는 백엔드 기반을 만들었다.

이번 백엔드 작업은 DB 스키마, JPA 엔티티, Repository, 생성/조회/삭제/완료 API, 서비스 단위 테스트까지 단계적으로 진행했다.

## 결정

- 진행 중인 개인 통독은 사용자당 1개만 허용했다.
- `reading_plans`, `reading_plan_items`, `reading_progress`를 분리했다.
- `reading_plan_items`에는 계획 생성 시 읽을 모든 장을 미리 펼쳐 저장했다.
- `item_order`는 전체 통독 순서를, `day_number`는 하루 목표 장 수 기준의 묶음을 표현하게 했다.
- 장 읽음 완료는 `reading_progress`에 별도로 저장했다.
- 하루 목표 장 수는 `1~10` 범위로 제한했다.
- 계획 생성, 장 완료 중복은 `409 CONFLICT`로 처리했다.
- 없는 계획과 다른 사용자의 계획 접근은 모두 `404 NOT_FOUND`로 처리했다.
- 서비스 규칙은 `ReadingPlanServiceTest` 단위 테스트로 보호했다.

## 테이블 구조

```text
reading_plans
- 사용자, 제목, 시작일, 하루 목표, 상태

reading_plan_items
- 계획에 포함된 장 목록
- day_number: 하루 목표 기준 묶음
- item_order: 전체 읽기 순서

reading_progress
- 사용자가 완료한 장 기록
- completed_at 저장
```

진행 중 계획 1개 제한은 일반 unique constraint가 아니라 partial unique index로 처리했다.

```sql
CREATE UNIQUE INDEX uk_reading_plans_user_in_progress
    ON reading_plans(user_id)
    WHERE status = 'IN_PROGRESS';
```

이렇게 하면 완료된 계획이 쌓이더라도, 진행 중인 계획만 사용자당 1개로 제한할 수 있다.

## 트레이드오프

처음에는 하나의 테이블에 계획과 진행 상태를 모두 넣을 수도 있었다.
하지만 통독은 "계획에 포함된 장 목록"과 "사용자가 실제 완료한 장"이 다른 개념이다.
둘을 분리하면 아직 읽지 않은 장, 오늘 읽을 분량, 전체 진행률, 완료한 장 재열람을 계산하기 쉬워진다.

`reading_plan_items`를 미리 펼쳐 저장한 것도 같은 이유다.
요청 때마다 선택한 책과 장 수를 다시 계산할 수도 있지만, MVP에서는 계획 생성 시 한 번 계산해 고정하는 편이 더 단순하다.
프론트는 저장된 item 목록을 기준으로 진도표와 성경통독표를 그릴 수 있다.

`day_number`와 `item_order`를 분리한 점도 중요하다.
`item_order`는 요한복음 1장, 2장, 3장처럼 전체 순서를 안정적으로 나타낸다.
`day_number`는 하루 3장씩 읽는 계획에서 1일차, 2일차 같은 표시를 만들기 위한 값이다.
두 값을 분리하면 UI에서 일차별 목록과 전체 장 순서를 각각 다룰 수 있다.

소유자가 아닌 계획 접근을 403이 아니라 404로 처리한 것은 보안 관점의 선택이다.
다른 사용자의 plan id가 실제 존재한다는 사실을 노출하지 않기 위해, 없는 계획과 동일하게 응답한다.

## 검증

- Supabase SQL Editor에서 `reading_plans`, `reading_plan_items`, `reading_progress` DDL 실행
- Swagger에서 통독 생성, 내 통독 조회, 삭제, 장 완료 API 확인
- 중복 생성 409 확인
- 없는 계획 404 확인
- 중복 장 완료 409 확인
- `ReadingPlanServiceTest`로 생성/조회/삭제/완료 및 주요 예외 흐름 검증

```bash
./gradlew.bat test --tests "com.bb.bible.domain.readingplan.service.ReadingPlanServiceTest"
```

## 포트폴리오 포인트

- 개인 통독을 제품 기획에서 DB/API/테스트까지 단계적으로 구현했다.
- partial unique index로 "진행 중 계획은 사용자당 1개"라는 비즈니스 규칙을 DB 레벨에서 보장했다.
- 계획 데이터와 완료 데이터를 분리해 이후 단체 통독의 멤버별 진행률로 확장할 수 있는 기반을 만들었다.
- `item_order`와 `day_number`를 분리해 전체 순서와 일차별 UI 요구사항을 동시에 만족시켰다.
- 서비스 레벨 검증과 DB 제약을 함께 사용해 잘못된 입력과 중복 데이터를 방어했다.
- 404, 409 상태를 상황별로 구분해 프론트엔드가 사용자 안내를 안정적으로 만들 수 있게 했다.
- 구현 후 서비스 단위 테스트를 추가해 핵심 비즈니스 규칙이 깨지지 않게 보호했다.
