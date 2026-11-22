package com.cozybench.user.controller;

import com.cozybench.guest.GuestSessionRecord;
import com.cozybench.guest.GuestSessionRegistry;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final GuestSessionRegistry guestSessions;

    public UserController(GuestSessionRegistry guestSessions) {
        this.guestSessions = guestSessions;
    }

    @GetMapping("/me")
    public java.util.Map<String, String> currentUser(HttpServletRequest request) {
        Object value = request.getAttribute(GuestSessionRegistry.REQUEST_ATTRIBUTE);
        String sessionId = value instanceof GuestSessionRecord record
                ? record.guestSessionId()
                : guestSessions.getOrCreate(request.getSession(true)).guestSessionId();
        return java.util.Map.of("sessionId", sessionId);
    }
}
