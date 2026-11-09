package com.cozybench.guest;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.servlet.HandlerInterceptor;

public class GuestSessionMiddleware implements HandlerInterceptor {
    private final GuestSessionRegistry sessions;

    public GuestSessionMiddleware(GuestSessionRegistry sessions) {
        this.sessions = sessions;
    }

    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler
    ) {
        GuestSessionRecord guest = sessions.getOrCreate(request.getSession(true));
        request.setAttribute(GuestSessionRegistry.REQUEST_ATTRIBUTE, guest);
        return true;
    }
}
