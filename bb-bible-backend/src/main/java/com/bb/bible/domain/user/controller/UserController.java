package com.bb.bible.domain.user.controller;

import com.bb.bible.domain.user.dto.UpdateNicknameRequest;
import com.bb.bible.domain.user.dto.UserMeResponse;
import com.bb.bible.domain.user.entity.User;
import com.bb.bible.domain.user.service.UserService;
import com.bb.bible.global.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserMeResponse getMe(
        @AuthenticationPrincipal JwtTokenProvider.AuthUser authUser
    ) {
        UUID id = UUID.fromString(authUser.sub());
        User user = userService.getOrCreate(id, authUser.email());

        return UserMeResponse.from(user);
    }

    @PutMapping("/me")
    public UserMeResponse updateMe(
        @AuthenticationPrincipal JwtTokenProvider.AuthUser authUser,
        @RequestBody UpdateNicknameRequest request
    ) {
        UUID id = UUID.fromString(authUser.sub());
        User user = userService.updateNickname(id, authUser.email(), request.nickname());
        return UserMeResponse.from(user);
    }
}
