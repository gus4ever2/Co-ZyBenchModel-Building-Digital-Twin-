package com.cozybench.config;

import jakarta.validation.Validator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.mapping.event.ValidatingEntityCallback;

@Configuration
@EnableMongoAuditing
public class MongoConfig {

    @Bean
    public ValidatingEntityCallback validatingMongoCallback (
            Validator validator
    ) {
        return new ValidatingEntityCallback (validator);
    }
}
