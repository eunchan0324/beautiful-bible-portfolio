package com.bb.bible.domain.aicontent.client;

public class ChapterSummaryPromptBuilder {

    private ChapterSummaryPromptBuilder() {
    }

    public static String build(ChapterSummaryAiRequest request) {
        return """
            아래 성경 본문을 한국어 1문장으로 요약하세요.

            규칙:
            - JSON 객체 하나만 출력합니다.
            - JSON에는 summary 필드만 포함합니다.
            - summary 값은 반드시 완성된 한국어 문장이어야 합니다.
            - summary 값은 반드시 아래 허용 종결 중 하나로 끝나야 합니다.
            - 본문 앞부분만 요약하지 말고, 시작-중간-끝의 중심 흐름이 모두 드러나게 작성합니다.
            - 본문 단어를 단순히 나열하지 말고, 장 전체가 말하는 중심 내용을 자연스럽게 설명합니다.
            - 사건을 쉼표처럼 나열하지 말고, 핵심 흐름 하나로 묶어 설명합니다.
            - ~하시고, ~하시며, ~하시고처럼 같은 연결어를 3번 이상 반복하지 않습니다.
            - "~하니 보여 줍니다", "~하시니 보여 줍니다"처럼 목적어가 빠진 어색한 연결을 사용하지 않습니다.
            - "보여 줍니다"로 끝낼 때는 무엇을 보여 주는지 문장 안에 명확히 씁니다.
            - 설교, 권면, 묵상 적용은 하지 않습니다.
            - 특정 교리적 결론을 단정하지 않습니다.
            - 본문 밖의 지식을 추가하지 않습니다.
            - "예수 그리스도"라는 표현을 직접 추가하지 않습니다.
            - "나", "우리", "독자", "성도" 같은 독자 대입 표현을 사용하지 않습니다.
            - "기록한 장입니다", "대한 장입니다" 표현은 사용하지 않습니다.
            - "이 장은", "본 장은"으로 시작하지 않습니다.
            - 너무 일반적인 표현만 사용하지 말고, 해당 장의 고유한 흐름이 드러나게 작성합니다.
            - summary 값은 40자 미만이면 실패입니다.
            - summary 값은 공백 포함 40자 이상 120자 이하로 작성합니다.
            - 허용 종결 목록에 있는 정확한 문자열로만 끝냅니다.
            - 금지 종결: ~한다. ~된다. ~신다. ~었다. ~였다.

            허용 종결:
            - 장입니다.
            - 보여 줍니다.
            - 나타냅니다.
            - 다룹니다.
            - 묘사합니다.
            - 전합니다.

            입력:
            - 책: %s (%s)
            - 장: %d장
            - 본문(운영 한국어 본문):
            %s

            %s
            출력:
            {"summary":"..."}
            """.formatted(
            request.bookName(),
            request.bookCode(),
            request.chapterNum(),
            request.chapterText(),
            buildRetryInstruction(request)
        );
    }

    private static String buildRetryInstruction(ChapterSummaryAiRequest request) {
        if (request.retryReason() == null || request.retryReason().isBlank()) {
            return "";
        }

        return """
            이전 응답은 아래 이유로 검증에 실패했습니다.
            - %s

            이전 summary를 그대로 다시 쓰지 마세요.
            40자 이상 120자 이하이며, 허용 종결 중 하나로 끝나는 새 문장을 작성하세요.
            """.formatted(request.retryReason());
    }
}
