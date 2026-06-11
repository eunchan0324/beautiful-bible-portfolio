package com.bb.bible.domain.aicontent.controller;

import com.bb.bible.domain.aicontent.dto.PersonCommentaryDetailResponse;
import com.bb.bible.domain.aicontent.dto.PersonCommentaryListItemResponse;
import com.bb.bible.domain.aicontent.service.PersonCommentaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/commentaries/persons")
@RequiredArgsConstructor
public class PersonCommentaryController {

    private final PersonCommentaryService personCommentaryService;

    @GetMapping
    public List<PersonCommentaryListItemResponse> getPersonCommentaries() {
        return personCommentaryService.getPersonCommentaries();
    }

    @GetMapping("/{personCode}")
    public PersonCommentaryDetailResponse getPersonCommentary(
        @PathVariable String personCode
    ) {
        return personCommentaryService.getPersonCommentary(personCode);
    }
}
