package com.bb.bible.domain.user.dto;

import com.bb.bible.domain.user.entity.User;

import java.util.UUID;

public record UserMeResponse(
    UUID id,
    String email,
    String nickname,
    String role
) {
    public static UserMeResponse from(User user) {
        return new UserMeResponse(
            user.getId(),
            user.getEmail(),
            user.getNickname(),
            user.getRole()
        );
    }
}
