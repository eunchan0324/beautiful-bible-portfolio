package com.bb.bible.domain.push.controller;

import com.bb.bible.config.JpaConfig;
import com.bb.bible.config.OpenApiConfig;
import com.bb.bible.config.SecurityConfig;
import com.bb.bible.domain.push.config.PushSchedulerProperties;
import com.bb.bible.domain.push.service.TodayVersePushService;
import com.bb.bible.global.ratelimit.RateLimitFilter;
import com.bb.bible.global.security.JwtAuthenticationFilter;
import com.bb.bible.global.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(
    controllers = TodayVersePushSchedulerController.class,
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = {
            SecurityConfig.class,
            JpaConfig.class,
            OpenApiConfig.class,
            RateLimitFilter.class,
            JwtAuthenticationFilter.class,
            JwtTokenProvider.class
        }
    )
)
@Import(TodayVersePushSchedulerControllerTest.TestConfig.class)
class TodayVersePushSchedulerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TodayVersePushService todayVersePushService;

    @BeforeEach
    void setUp() {
        reset(todayVersePushService);
    }

    @Test
    void sendTodayVerseRejectsInvalidSchedulerSecret() throws Exception {
        mockMvc.perform(post("/api/v1/internal/push/today-verse")
                .header("X-Scheduler-Secret", "wrong-secret"))
            .andExpect(status().isUnauthorized());

        verifyNoInteractions(todayVersePushService);
    }

    @Test
    void sendTodayVerseRunsWithValidSchedulerSecret() throws Exception {
        when(todayVersePushService.sendTodayVerseToAllSubscribers()).thenReturn(3);

        mockMvc.perform(post("/api/v1/internal/push/today-verse")
                .header("X-Scheduler-Secret", "test-secret"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.sentCount").value(3));

        verify(todayVersePushService).sendTodayVerseToAllSubscribers();
    }

    static class TestConfig {

        @Bean
        PushSchedulerProperties pushSchedulerProperties() {
            return new PushSchedulerProperties("test-secret");
        }

        @Bean
        TodayVersePushService todayVersePushService() {
            return mock(TodayVersePushService.class);
        }
    }
}
