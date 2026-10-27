package com.cozybench.config.properties;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

@Validated
@ConfigurationProperties(prefix = "cozybench.security.jwt")
public record JwtProperties(

        @NotBlank(message = "JWT issuer must be configured")
        String issuer,

        @NotBlank(message = "JWT secret must be configured")
        String secret,

        @NotNull(message = "JWT expiration must be configured")
        Duration accessTokenExpiration

) {
}