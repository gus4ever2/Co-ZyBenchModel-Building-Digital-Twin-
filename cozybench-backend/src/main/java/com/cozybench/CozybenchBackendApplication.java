package com.cozybench;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CozybenchBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(CozybenchBackendApplication.class, args);
    }

}
