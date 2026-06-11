package com.bb.bible.domain.aicontent.repository;

import com.bb.bible.domain.aicontent.entity.PersonCommentary;
import com.bb.bible.domain.aicontent.entity.PersonCommentaryStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PersonCommentaryRepository extends JpaRepository<PersonCommentary, Long> {

    List<PersonCommentary> findAllByStatusOrderByIdAsc(PersonCommentaryStatus status);

    Optional<PersonCommentary> findByPersonCodeAndStatus(
        String personCode,
        PersonCommentaryStatus status
    );
}
