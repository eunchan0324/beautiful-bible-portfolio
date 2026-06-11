package com.bb.bible.domain.aicontent.service;

import com.bb.bible.domain.aicontent.dto.PersonCommentaryDetailResponse;
import com.bb.bible.domain.aicontent.dto.PersonCommentaryListItemResponse;
import com.bb.bible.domain.aicontent.entity.PersonCommentary;
import com.bb.bible.domain.aicontent.entity.PersonCommentaryStatus;
import com.bb.bible.domain.aicontent.repository.PersonCommentaryRepository;
import com.bb.bible.global.exception.NotFoundException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PersonCommentaryServiceTest {

    private PersonCommentaryRepository personCommentaryRepository;
    private PersonCommentaryService personCommentaryService;

    @BeforeEach
    void setUp() {
        personCommentaryRepository = mock(PersonCommentaryRepository.class);
        personCommentaryService = new PersonCommentaryService(
            personCommentaryRepository,
            new ObjectMapper()
        );
    }

    @Test
    void getPersonCommentariesReturnsApprovedListItems() {
        PersonCommentary abraham = samplePersonCommentary();

        when(personCommentaryRepository.findAllByStatusOrderByIdAsc(PersonCommentaryStatus.APPROVED))
            .thenReturn(List.of(abraham));

        List<PersonCommentaryListItemResponse> responses =
            personCommentaryService.getPersonCommentaries();

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).personCode()).isEqualTo("abraham");
        assertThat(responses.get(0).name()).isEqualTo("아브라함");
        assertThat(responses.get(0).shortDescription())
            .isEqualTo("하나님의 약속을 따라 길을 떠난 믿음의 조상");
        assertThat(responses.get(0).keywords()).containsExactly("믿음", "언약");

        verify(personCommentaryRepository)
            .findAllByStatusOrderByIdAsc(PersonCommentaryStatus.APPROVED);
    }

    @Test
    void getPersonCommentaryReturnsDetail() {
        PersonCommentary abraham = samplePersonCommentary();

        when(personCommentaryRepository.findByPersonCodeAndStatus(
            "abraham",
            PersonCommentaryStatus.APPROVED
        )).thenReturn(Optional.of(abraham));

        PersonCommentaryDetailResponse response =
            personCommentaryService.getPersonCommentary("abraham");

        assertThat(response.personCode()).isEqualTo("abraham");
        assertThat(response.name()).isEqualTo("아브라함");
        assertThat(response.storyFlow()).hasSize(1);
        assertThat(response.storyFlow().get(0).title()).isEqualTo("부르심");
        assertThat(response.storyFlow().get(0).summary())
            .isEqualTo("하나님은 아브라함을 부르신다.");
        assertThat(response.storyFlow().get(0).verseKeys()).containsExactly("창12:1");
        assertThat(response.keyVerses()).hasSize(1);
        assertThat(response.keyVerses().get(0).verseKey()).isEqualTo("창12:1");
        assertThat(response.keyVerses().get(0).label()).isEqualTo("부르심");
        assertThat(response.relatedBooks()).containsExactly("창", "롬");
        assertThat(response.keywords()).containsExactly("믿음", "언약");
    }

    @Test
    void getPersonCommentaryThrowsNotFoundWhenPersonDoesNotExist() {
        when(personCommentaryRepository.findByPersonCodeAndStatus(
            "unknown",
            PersonCommentaryStatus.APPROVED
        )).thenReturn(Optional.empty());

        assertThatThrownBy(() -> personCommentaryService.getPersonCommentary("unknown"))
            .isInstanceOf(NotFoundException.class)
            .hasMessage("Person commentary not found");
    }

    private PersonCommentary samplePersonCommentary() {
        return PersonCommentary.builder()
            .personCode("abraham")
            .name("아브라함")
            .shortDescription("하나님의 약속을 따라 길을 떠난 믿음의 조상")
            .description("아브라함은 하나님의 부르심을 받고 길을 떠난 인물이다.")
            .storyFlow("""
                [
                  {
                    "title": "부르심",
                    "summary": "하나님은 아브라함을 부르신다.",
                    "verseKeys": ["창12:1"]
                  }
                ]
                """)
            .keyVerses("""
                [
                  {
                    "verseKey": "창12:1",
                    "label": "부르심"
                  }
                ]
                """)
            .relatedBooks("""
                ["창", "롬"]
                """)
            .keywords("""
                ["믿음", "언약"]
                """)
            .status(PersonCommentaryStatus.APPROVED)
            .model("manual")
            .build();
    }
}
