package com.bb.bible.domain.aicontent.service;

import com.bb.bible.domain.aicontent.dto.PersonCommentaryDetailResponse;
import com.bb.bible.domain.aicontent.dto.PersonCommentaryListItemResponse;
import com.bb.bible.domain.aicontent.dto.PersonKeyVerseResponse;
import com.bb.bible.domain.aicontent.dto.PersonStoryStepResponse;
import com.bb.bible.domain.aicontent.entity.PersonCommentary;
import com.bb.bible.domain.aicontent.entity.PersonCommentaryStatus;
import com.bb.bible.domain.aicontent.repository.PersonCommentaryRepository;
import com.bb.bible.global.exception.NotFoundException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PersonCommentaryService {

    private final PersonCommentaryRepository personCommentaryRepository;
    private final ObjectMapper objectMapper;

    public List<PersonCommentaryListItemResponse> getPersonCommentaries() {
        return personCommentaryRepository
            .findAllByStatusOrderByIdAsc(PersonCommentaryStatus.APPROVED)
            .stream()
            .map(this::toListItemResponse)
            .toList();
    }

    public PersonCommentaryDetailResponse getPersonCommentary(String personCode) {
        PersonCommentary personCommentary = personCommentaryRepository
            .findByPersonCodeAndStatus(personCode, PersonCommentaryStatus.APPROVED)
            .orElseThrow(() -> new NotFoundException("Person commentary not found"));

        return new PersonCommentaryDetailResponse(
            personCommentary.getPersonCode(),
            personCommentary.getName(),
            personCommentary.getShortDescription(),
            personCommentary.getDescription(),
            parseStoryFlow(personCommentary.getStoryFlow()),
            parseKeyVerses(personCommentary.getKeyVerses()),
            parseStringList(personCommentary.getRelatedBooks()),
            parseStringList(personCommentary.getKeywords())
        );
    }

    private PersonCommentaryListItemResponse toListItemResponse(PersonCommentary personCommentary) {
        return new PersonCommentaryListItemResponse(
            personCommentary.getPersonCode(),
            personCommentary.getName(),
            personCommentary.getShortDescription(),
            parseStringList(personCommentary.getKeywords())
        );
    }

    private List<String> parseStringList(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse person commentary string list field", e);
        }
    }

    private List<PersonStoryStepResponse> parseStoryFlow(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse person commentary storyFlow field", e);
        }
    }

    private List<PersonKeyVerseResponse> parseKeyVerses(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse person commentary keyVerses field", e);
        }
    }
}
