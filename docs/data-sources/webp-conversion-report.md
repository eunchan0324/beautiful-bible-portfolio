# WEBP 성경 데이터 변환 리포트

> Issue #182: WEBP 성경 데이터 변환 및 검증

---

## 원본

- Source URL: https://ebible.org/Scriptures/engwebp_vpl.zip
- Source file: engwebp_vpl.txt
- Local source path: C:\Users\dmsck\AppData\Local\Temp\bb-webp-source\vpl\engwebp_vpl.txt
- Output path: C:\workspace\BB-Beautiful-Bible\bb-bible-frontend\public\bible-webp.json
- Generated at: 2026-06-10T05:29:57.653Z

---

## 변환 결과

- 원본 VPL non-empty lines: 31103
- 한국어 bible.json 절 수: 31088
- WEBP 변환 절 수: 31085
- WEBP 누락 절 수: 3
- WEBP에만 있는 절 수: 0
- 중복 verse_key 수: 0
- 알 수 없는 원본 책 코드 수: 0
- 파싱 실패 라인 수: 0
- 원본에서 본문이 비어 있는 절 수: 5
- 수동 절 번호 보정 수: 8

---

## 책별 WEBP 절 수

- 창: 1533
- 출: 1213
- 레: 859
- 민: 1288
- 신: 956
- 수: 658
- 삿: 618
- 룻: 85
- 삼상: 810
- 삼하: 695
- 왕상: 816
- 왕하: 719
- 대상: 941
- 대하: 822
- 스: 280
- 느: 406
- 에: 167
- 욥: 1070
- 시: 2458
- 잠: 915
- 전: 222
- 아: 117
- 사: 1292
- 렘: 1361
- 애: 154
- 겔: 1272
- 단: 357
- 호: 197
- 욜: 73
- 암: 146
- 옵: 21
- 욘: 48
- 미: 105
- 나: 47
- 합: 56
- 습: 53
- 학: 38
- 슥: 211
- 말: 55
- 마: 1071
- 막: 678
- 눅: 1150
- 요: 879
- 행: 1003
- 롬: 432
- 고전: 437
- 고후: 256
- 갈: 149
- 엡: 155
- 빌: 104
- 골: 95
- 살전: 89
- 살후: 47
- 딤전: 113
- 딤후: 83
- 딛: 46
- 몬: 25
- 히: 303
- 약: 108
- 벧전: 105
- 벧후: 61
- 요일: 105
- 요이: 13
- 요삼: 15
- 유: 25
- 계: 404

---

## WEBP 누락 절 샘플

- 눅17:36
- 행8:37
- 행15:34

---

## WEBP에만 있는 절 샘플

- 없음

---

## 중복 verse_key 샘플

- 없음

---

## 알 수 없는 원본 책 코드

- 없음

---

## 파싱 실패 라인 샘플

- 없음

---

## 원본에서 본문이 비어 있는 절 샘플

- 눅17:36
- 행8:37
- 행15:34
- 행24:7
- 롬16:25

---

## 수동 절 번호 보정

- 고후13:11 <= 고후13:11, 고후13:12 (한국어 기준 본문 고후13:11은 WEBP 고후13:11-12에 해당한다.)
- 고후13:12 <= 고후13:13 (한국어 기준 본문 고후13:12는 WEBP 고후13:13에 해당한다.)
- 고후13:13 <= 고후13:14 (한국어 기준 본문 고후13:13은 WEBP 고후13:14에 해당한다.)
- 롬16:25 <= 롬14:24 (WEBP는 롬16:25-27 송영을 롬14:24-26에 둔다.)
- 롬16:26 <= 롬14:25 (WEBP는 롬16:25-27 송영을 롬14:24-26에 둔다.)
- 롬16:27 <= 롬14:26 (WEBP는 롬16:25-27 송영을 롬14:24-26에 둔다.)
- 요삼1:14 <= 요삼1:14 (WEBP 요삼1:14가 한국어 기준 본문 요삼1:14-15 내용을 함께 담고 있어 앞부분만 요삼1:14로 사용한다.)
- 요삼1:15 <= 요삼1:14 (WEBP 요삼1:14가 한국어 기준 본문 요삼1:14-15 내용을 함께 담고 있어 뒷부분을 요삼1:15로 사용한다.)

---

## 대표 절 확인

- 창1:1: In the beginning, God created the heavens and the earth.
- 시23:1: A Psalm by David. The LORD is my shepherd; I shall lack nothing.
- 요1:1: In the beginning was the Word, and the Word was with God, and the Word was God.
- 요3:16: For God so loved the world, that he gave his only born Son, that whoever believes in him should not perish, but have eternal life.
- 롬8:28: We know that all things work together for good for those who love God, for those who are called according to his purpose.

---

## 판정

판본상 생략 절과 절 번호 차이는 리포트에 기록한다. FE 표시 시 WEBP 본문이 없는 절은 대조 역본을 숨기고, 후속 QA에서 대표 장을 확인한다.
