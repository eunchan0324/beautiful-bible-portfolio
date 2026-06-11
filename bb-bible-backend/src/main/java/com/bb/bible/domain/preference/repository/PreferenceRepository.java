package com.bb.bible.domain.preference.repository;

import com.bb.bible.domain.preference.entity.UserPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PreferenceRepository extends JpaRepository<UserPreference, Long> {
    Optional<UserPreference> findByUserId(UUID userId);
}
