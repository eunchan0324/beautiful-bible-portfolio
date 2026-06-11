package com.bb.bible.domain.preference.entity;

import com.bb.bible.domain.user.entity.User;
import com.bb.bible.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "user_preferences")
public class UserPreference extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Builder.Default
    @Column(name = "font_size", length = 10, nullable = false)
    private String fontSize = "large";

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "theme_mode", length = 10, nullable = false)
    private ThemeMode themeMode = ThemeMode.SYSTEM;

    @Builder.Default
    @Column(name = "show_verse_numbers", nullable = false)
    private boolean showVerseNumbers = true;

    public void update(String fontSize, ThemeMode themeMode, boolean showVerseNumbers) {
        this.fontSize = fontSize;
        this.themeMode = themeMode;
        this.showVerseNumbers = showVerseNumbers;
    }
}
