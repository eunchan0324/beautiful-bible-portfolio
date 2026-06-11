package com.bb.bible.global.health;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class HealthController {

    @GetMapping("/api/v1/health")
    HealthResponse health() {
        return new HealthResponse("UP");
    }

    record HealthResponse(String status) {
    }
}
