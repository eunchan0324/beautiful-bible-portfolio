# #190 TTS QA 결과와 서버 확장 검토

## 배경

#188에서 성경 읽기 화면에 브라우저 내장 TTS MVP를 구현했고, #189에서는 iPhone PWA 기준으로 모바일 QA를 진행했다.
QA 결과 현재 MVP 범위에서는 별도 수정 이슈로 분리할 문제를 찾지 못했다.

이 문서는 #189 QA 결과를 흡수하고, 이후 서버 TTS 또는 오디오 성경으로 확장하기 전에 확인해야 할 기술, 비용, 사용권 체크리스트를 정리한다.

## #189 모바일/PWA QA 결과

확인 환경:

- iPhone PWA
- 성경 읽기 화면
- 브라우저 Web Speech API 기반 TTS

확인한 항목:

- 듣기 시작
- 일시정지 / 이어듣기
- 이전 절 / 다음 절 이동
- 스크롤로 다음 장을 이어붙인 상태에서 현재 보이는 장 기준 재생
- 구절 클릭 시 해당 절로 점프
- 하단 플레이어 표시
- 속도 선택
- 모바일 PWA 화면에서 주요 UI 깨짐 없음

결론:

- #188 MVP는 현재 사용 가능한 수준으로 판단한다.
- #189는 별도 구현 PR 없이 QA 완료 이슈로 닫는다.
- 남은 검토는 서버 TTS 확장과 사용권/비용 판단으로 #190에 통합한다.

## 현재 MVP 유지 판단

현재 Beautiful Bible의 성경 본문은 프론트엔드 정적 JSON에서 읽는다.
Render 무료 서버가 잠들어 있어도 성경 읽기는 바로 가능하다.
TTS도 브라우저 내장 `speechSynthesis`를 사용하므로 서버 호출, 음성 파일 저장, 결제 설정이 필요 없다.

따라서 현재 상황에서는 브라우저 TTS MVP를 유지하는 것이 가장 현실적이다.

- 서버 비용 없음
- 콜드스타트 영향 없음
- 별도 음성 파일 저장소 불필요
- 현재 정적 성경 데이터 구조와 잘 맞음
- 사용자 수요를 먼저 검증하기 좋음

단점도 명확하다.

- 음성 품질이 브라우저와 OS에 의존한다.
- 한국어 음성의 억양, 속도 반영, 일시정지 반응이 환경마다 다를 수 있다.
- 백그라운드 재생, 잠금화면 컨트롤, 오프라인 오디오 저장 같은 앱 수준 오디오 UX는 기대하기 어렵다.

## 서버 TTS로 확장할 때 생기는 변화

서버 TTS는 "텍스트를 읽어주는 기능"이 아니라 "본문을 음성 파일 또는 스트림으로 재가공해 배포하는 기능"에 가깝다.
그래서 다음 결정이 함께 필요하다.

- 어떤 본문을 합성할 것인가
- 합성 결과물을 저장해도 되는가
- 저장한다면 어디에 저장할 것인가
- 동일 장을 여러 사용자가 들을 때 캐시할 것인가
- 음성 provider 비용을 누가 부담할 것인가
- 통독/성경 읽기/대조 역본별로 어떤 음성을 제공할 것인가
- 성경 본문 사용권이 TTS 합성 및 저장까지 허용하는가

현재는 이 결정들이 아직 제품적으로 검증되지 않았으므로, 서버 TTS는 후속 Phase로 미루는 것이 맞다.

## 사용권 체크리스트

이 문서는 법률 자문이 아니다.
서버 TTS를 도입하기 전에는 반드시 성경 본문 권리자 또는 사용 계약 조건을 확인해야 한다.

특히 확인할 질문:

- 운영 한국어 본문을 화면에 표시하는 권리와 음성으로 합성하는 권리가 같은가
- 합성된 음성 파일을 서버에 저장해도 되는가
- 저장한 음성 파일을 여러 사용자에게 재사용해도 되는가
- 합성 음성 파일을 CDN에 배포해도 되는가
- 무료 서비스와 후원 기반 서비스에서 조건이 달라지는가
- 성경 본문 일부가 아니라 장 전체 또는 성경 전체를 반복 생성하는 것이 허용되는가
- provider 약관상 입력 텍스트와 생성 음성의 저장/재사용 조건은 어떤가

MVP의 브라우저 TTS는 사용자의 기기에서 현재 화면의 텍스트를 읽는 방식이다.
반면 서버 TTS는 서비스가 성경 본문을 음성 산출물로 변환해 관리하는 방식이므로 권리 검토 범위가 더 넓어진다.

## Provider 비교

### 브라우저 Web Speech API

MDN 기준 `SpeechSynthesis`는 Web Speech API의 음성 합성 컨트롤러이며, 기기의 사용 가능한 음성을 가져오고 말하기, 일시정지, 재개, 취소 같은 명령을 제공한다.

적합한 경우:

- 서버 비용 없이 MVP를 검증하고 싶을 때
- 현재 화면의 본문만 읽으면 충분할 때
- 음성 품질보다 빠른 기능 검증이 중요할 때

한계:

- 음성 품질과 속도 반영이 환경마다 다름
- 음성 파일 저장/공유 불가
- 앱 수준 오디오 기능이 제한적

### Google Cloud Text-to-Speech

Google Cloud Text-to-Speech는 월별 합성 문자 수를 기준으로 과금한다.
공식 가격 문서에 따르면 billing을 활성화해야 하며, 공백과 줄바꿈도 과금 문자에 포함된다.
2026-06-10 기준으로 Standard/WaveNet 계열은 100만 문자당 $4, Neural2 계열은 100만 문자당 $16, Chirp 3 HD는 100만 문자당 $30 수준이다.

적합한 경우:

- 한국어 음성 품질을 더 안정적으로 맞추고 싶을 때
- 장별 음성 파일을 캐싱해 여러 사용자에게 제공하고 싶을 때
- Google Cloud 저장소/CDN과 함께 운영할 계획이 있을 때

주의점:

- billing 설정과 사용량 모니터링이 필요하다.
- 성경 전체 또는 여러 장을 미리 생성하면 비용이 빠르게 커질 수 있다.
- 본문 사용권과 합성 결과물 저장 가능 여부를 먼저 확인해야 한다.

### Amazon Polly

Amazon Polly는 처리한 텍스트 문자 수를 기준으로 월별 과금한다.
공식 가격 문서 기준 Standard는 100만 문자당 $4, Neural은 100만 문자당 $16, Long-Form은 100만 문자당 $100, Generative는 100만 문자당 $30이다.
무료 티어는 음성 유형별로 다르며, 일부는 첫 12개월 조건이 붙는다.

적합한 경우:

- AWS 인프라에 저장소, CDN, 배치 작업을 함께 둘 때
- Standard/Neural/Long-Form 등 선택지를 비교하고 싶을 때
- 장문 오디오 생성과 캐싱을 별도 배치로 운영하고 싶을 때

주의점:

- 한국어 음성 품질과 실제 성경 본문 낭독 자연스러움은 별도 샘플 검증이 필요하다.
- 무료 티어 조건과 실제 운영 비용을 분리해서 봐야 한다.
- 음성 파일 저장 및 재사용 권리 확인이 필요하다.

### OpenAI Text-to-Speech

OpenAI Text-to-Speech API는 모델, 입력 텍스트, voice를 받아 음성 오디오를 생성한다.
공식 문서 기준 기본 출력은 MP3이며, `gpt-4o-mini-tts`, `tts-1`, `tts-1-hd` 같은 모델을 사용할 수 있고, 실시간 스트리밍과 여러 출력 포맷을 지원한다.
문서에는 내장 voice들이 영어에 최적화되어 있다고 안내되어 있으므로, 한국어 성경 낭독 품질은 별도 샘플 검증이 필요하다.

적합한 경우:

- 톤, 억양, 스타일 제어가 중요한 기능을 실험할 때
- 장별 파일 생성보다 실시간 생성이나 짧은 구간 생성이 필요할 때
- 향후 AI 해설 음성, 묵상 안내 음성 등과 연결할 가능성이 있을 때

주의점:

- 한국어 성경 장문 낭독 품질은 실제 샘플 검증이 필요하다.
- 성경 본문을 외부 API에 전송하는 정책 검토가 필요하다.
- 생성 음성 저장/재사용 정책과 본문 사용권을 함께 확인해야 한다.

## 데이터 구조 초안

서버 TTS를 실제로 도입한다면, 최소한 다음 정도의 캐시 테이블 또는 스토리지 메타데이터가 필요하다.

```text
tts_audio_cache
- id
- translation_code       // KRV, NKRV, WEB 등
- book_code
- chapter_num
- voice_provider        // google, aws, openai
- voice_id              // provider별 음성 식별자
- speed                 // 1.0 등
- format                // mp3, wav, opus
- storage_url
- duration_seconds
- character_count
- checksum              // 본문 변경 감지용
- status                // PENDING, READY, FAILED
- created_at
- updated_at
```

캐시 키는 다음 조합이 안전하다.

```text
translation_code + book_code + chapter_num + voice_provider + voice_id + speed + format + text_checksum
```

이렇게 해야 본문, 음성, 속도, 출력 포맷이 바뀌었을 때 이전 캐시를 잘못 재사용하지 않는다.

## Spring Boot 확장 범위

서버 TTS를 붙이면 Spring Boot에는 다음 기능이 필요하다.

- 장별 TTS 생성 요청 API
- 캐시 조회 API
- provider 호출 클라이언트
- 생성 상태 관리
- 실패 재시도
- 비용 방지를 위한 rate limit
- 관리자 또는 배치 작업으로 사전 생성
- Supabase Storage, S3, GCS 같은 파일 저장소 연동

추천 API 초안:

```text
GET /bible/{bookCode}/{chapterNum}/audio?translation=NKRV&voice=...
POST /admin/tts/audio
GET /admin/tts/audio/jobs/{jobId}
```

사용자 요청마다 즉시 생성하는 방식은 비용 폭주 위험이 있다.
초기에는 관리자 배치로 일부 장을 생성하거나, 많이 읽는 장만 on-demand 생성 후 캐싱하는 방식이 안전하다.

## 확장 판단 기준

서버 TTS를 도입할 만한 시점:

- 실제 사용자가 "브라우저 TTS 음성이 아쉽다"고 반복 피드백할 때
- 잠금화면/백그라운드 재생 요구가 생길 때
- 통독 기능에서 연속 오디오 재생 수요가 명확할 때
- 후원 또는 유료 서버 전환으로 월 비용을 감당할 수 있을 때
- 성경 본문과 합성 음성 저장/배포 권리가 확인됐을 때

아직 도입하지 않는 편이 나은 시점:

- 사용자 수요가 검증되지 않았을 때
- 본문 사용권이 불명확할 때
- 무료 서버 운영 단계일 때
- 음성 파일 저장소와 비용 모니터링이 준비되지 않았을 때

## 결론

현재는 브라우저 Web Speech API 기반 TTS MVP를 유지한다.
#189 QA 결과 iPhone PWA에서 주요 흐름은 사용 가능한 수준으로 확인됐다.

서버 TTS는 기능 자체보다 권리, 비용, 캐싱, 운영 복잡도가 더 큰 결정이다.
따라서 다음 단계에서는 provider 샘플을 바로 붙이기보다, 먼저 사용권 확인과 비용 추정, 캐시 설계를 마친 뒤 후원 또는 유료 서버 전환 시점에 별도 Phase로 진행하는 것이 안전하다.

## 참고 자료

- MDN Web Docs, SpeechSynthesis: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
- Google Cloud Text-to-Speech pricing: https://cloud.google.com/text-to-speech/pricing
- Amazon Polly pricing: https://aws.amazon.com/polly/pricing/
- OpenAI Text-to-Speech guide: https://developers.openai.com/api/docs/guides/text-to-speech
- OpenAI API pricing: https://openai.com/api/pricing/
