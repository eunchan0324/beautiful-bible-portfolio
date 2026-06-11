package com.bb.bible.domain.preference.service;

import com.bb.bible.domain.preference.dto.PreferenceResponse;
import com.bb.bible.domain.preference.dto.UpdatePreferenceRequest;
import com.bb.bible.domain.preference.entity.UserPreference;
import com.bb.bible.domain.preference.repository.PreferenceRepository;
import com.bb.bible.domain.user.entity.User;
import com.bb.bible.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PreferenceService {

    private final PreferenceRepository preferenceRepository;
    private final UserService userService;

    @Transactional
    public PreferenceResponse getPreference(UUID userId, String email) {
        UserPreference preference = getOrCreatePreference(userId, email);

        return PreferenceResponse.from(preference);
    }

    @Transactional
    public PreferenceResponse updatePreference(UUID userId, String email, UpdatePreferenceRequest request) {
        UserPreference preference = getOrCreatePreference(userId, email);

        preference.update(
            request.fontSize(),
            request.themeMode(),
            request.showVerseNumbers()
        );

        return PreferenceResponse.from(preference);
    }

    private UserPreference getOrCreatePreference(UUID userId, String email) {
        return preferenceRepository.findByUserId(userId)
            .orElseGet(() -> {
                User user = userService.getOrCreate(userId, email);
                UserPreference userPreference = UserPreference.builder()
                    .user(user)
                    .build();

                return preferenceRepository.save(userPreference);
            });
    }
}
