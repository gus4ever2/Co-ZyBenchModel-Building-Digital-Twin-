package com.cozybench.guest;

import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class GuestWebConfig implements WebMvcConfigurer {
    private final ObjectProvider<GuestSessionRegistry> guestSessions;

    public GuestWebConfig(ObjectProvider<GuestSessionRegistry> guestSessions) {
        this.guestSessions = guestSessions;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        GuestSessionRegistry sessions = guestSessions.getIfAvailable();
        if (sessions != null) {
            registry.addInterceptor(new GuestSessionMiddleware(sessions))
                    .addPathPatterns("/api/v1/guest/**");
        }
    }
}
