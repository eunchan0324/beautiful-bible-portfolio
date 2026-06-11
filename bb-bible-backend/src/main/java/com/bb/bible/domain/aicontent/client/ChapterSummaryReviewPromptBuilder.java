package com.bb.bible.domain.aicontent.client;

public class ChapterSummaryReviewPromptBuilder {

    private ChapterSummaryReviewPromptBuilder() {
    }

    public static String build(ChapterSummaryReviewRequest request) {
        return """
            아래 성경 장별 요약 후보의 문장 품질만 검수하세요.

            판정 기준:
            - PASS: 문장이 자연스럽고 앱 카드에 바로 사용할 수 있음
            - REVIEW: 의미는 맞지만 문장 흐름이 어색하거나 나열식이라 사람이 확인해야 함
            - REJECT: 너무 길거나, 어색하거나, 본문 밖 해석/권면/설교 느낌이 있어 사용하면 안 됨

            검수 기준:
            - 자연스러운 한국어 문장인가?
            - 사건을 쉼표처럼 나열만 하고 있지 않은가?
            - 마지막 표현이 어색하지 않은가?
            - 설교, 권면, 묵상 적용처럼 들리지 않는가?
            - 본문 밖 신학 해석을 단정하지 않는가?

            출력 규칙:
            - 반드시 JSON 객체만 반환합니다.
            - decision 값은 PASS, REVIEW, REJECT 중 하나입니다.
            - reason은 40자 이내의 짧은 한국어 이유입니다.
            - 개선 문장은 만들지 않습니다.

            출력 형식:
            {
              "decision": "PASS",
              "reason": "자연스러운 한국어 문장입니다."
            }

            요약 후보:
            - 책: %s
            - 장: %d
            - summary: %s
            """.formatted(
            request.bookCode(),
            request.chapterNum(),
            request.summary()
        );
    }
}
