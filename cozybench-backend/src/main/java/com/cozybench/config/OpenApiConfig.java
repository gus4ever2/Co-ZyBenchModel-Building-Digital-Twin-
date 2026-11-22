package com.cozybench.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI cozyBenchOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("CozyBench API")
                        .version("1.0")
                        .description("Spring API for session-based building components, plants and simulations."));
    }
}
