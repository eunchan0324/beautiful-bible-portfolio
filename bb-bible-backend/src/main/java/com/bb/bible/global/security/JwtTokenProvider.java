package com.bb.bible.global.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwsHeader;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Locator;
import io.jsonwebtoken.security.Jwk;
import io.jsonwebtoken.security.JwkSet;
import io.jsonwebtoken.security.Jwks;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.security.Key;

@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${supabase.jwks-url}")
    private String jwksUrl;

    @Value("${supabase.jwt-issuer}")
    private String jwtIssuer;

    private volatile JwkSet jwkSet;

    @PostConstruct
    void loadJwkSetOnStartup() {
        try {
            refreshJwkSet();
        } catch (Exception e) {
            log.warn("JWKS load failed at startup, will retry on first request: {}", e.getMessage());
        }
    }

    public record AuthUser(String sub, String email) {}

    public AuthUser parseToken(String token) {
        Claims claims = Jwts.parser()
            .keyLocator(jwsKeyLocator())
            .requireIssuer(jwtIssuer)
            .build()
            .parseSignedClaims(token)
            .getPayload();

        String sub = claims.getSubject();
        String email = claims.get("email", String.class);
        String role = claims.get("role", String.class);

        if (!"authenticated".equals(role)) {
            throw new IllegalArgumentException("Invalid role");
        }

        return new AuthUser(sub, email);
    }

    private Locator<Key> jwsKeyLocator() {
        return header -> {
            if (!(header instanceof JwsHeader jwsHeader)) {
                throw new JwtException("JWS header expected");
            }
            String kid = jwsHeader.getKeyId();
            if (kid == null) {
                throw new JwtException("Missing kid");
            }

            Key key = findKeyOrNull(kid, jwkSet);
            if (key != null) {
                return key;
            }

            try {
                refreshJwkSet();
            } catch (Exception e) {
                throw new JwtException("JWKS unavailable", e);
            }

            key = findKeyOrNull(kid, jwkSet);
            if (key != null) {
                log.info("JWKS refreshed for new kid: {}", kid);
                return key;
            }

            throw new JwtException("Unknown kid after JWKS refresh: " + kid);
        };
    }

    private Key findKeyOrNull(String kid, JwkSet snapshot) {
        if (snapshot == null) {
            return null;
        }
        return snapshot.getKeys().stream()
            .filter(k -> kid.equals(k.getId()))
            .findFirst()
            .map(Jwk::toKey)
            .orElse(null);
    }

    private synchronized void refreshJwkSet() throws Exception {
        try (var in = URI.create(jwksUrl).toURL().openStream()) {
            this.jwkSet = Jwks.setParser().build().parse(in);
        }
    }
}
