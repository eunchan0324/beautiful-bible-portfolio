package com.bb.bible.domain.user.service;

import com.bb.bible.domain.user.entity.User;
import com.bb.bible.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public User getOrCreate(UUID id, String email) {
        return userRepository.findById(id)
            .orElseGet(() -> insertOrReload(id, email));
    }

    private User insertOrReload(UUID id, String email) {
        try {
            return userRepository.save(
                User.builder()
                    .id(id)
                    .email(email)
                    .build()
            );
        } catch (DataIntegrityViolationException e) {
            return userRepository.findById(id)
                .orElseThrow(() -> e);
        }
    }

    @Transactional
    public User updateNickname(UUID id, String email, String nickname) {
        User user = getOrCreate(id, email);
        user.updateNickname(nickname);
        return user;
    }
}
