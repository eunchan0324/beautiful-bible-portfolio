package com.bb.bible.domain.user.entity;

import com.bb.bible.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "users")
public class User extends BaseEntity {

    @Id
    private UUID id;

    @Column(length = 255, nullable = false, unique = true)
    private String email;

    @Column(length = 100)
    private String nickname;

    @Builder.Default
    @Column(length = 20, nullable = false)
    private String role = "USER";

    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }
}
