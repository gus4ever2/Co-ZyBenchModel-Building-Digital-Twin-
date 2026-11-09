package com.cozybench.guest;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/** In-memory guest map; durable simulation ownership remains in MongoDB. */
@Component
public class GuestSessionRegistry {
    public static final String HTTP_SESSION_ATTRIBUTE = "cozybench.guestSessionId";
    public static final String REQUEST_ATTRIBUTE = GuestSessionRecord.class.getName();

    private final Map<String, GuestSessionRecord> guests = new ConcurrentHashMap<>();

    public GuestSessionRecord getOrCreate(HttpSession session) {
        Object stored = session.getAttribute(HTTP_SESSION_ATTRIBUTE);
        String id = stored instanceof String value && !value.isBlank()
                ? value
                : UUID.randomUUID().toString();
        if (!(stored instanceof String value) || value.isBlank()) {
            session.setAttribute(HTTP_SESSION_ATTRIBUTE, id);
        }
        GuestSessionRecord record = guests.computeIfAbsent(
                id,
                key -> new GuestSessionRecord(key, session)
        );
        record.refreshHttpSession(session);
        return record;
    }

    public void removeSimulation(String guestSessionId, String simulationId) {
        GuestSessionRecord record = guests.get(guestSessionId);
        if (record != null) record.removeSimulation(simulationId);
    }

    public void removeGuest(String guestSessionId) {
        GuestSessionRecord removed = guests.remove(guestSessionId);
        if (removed != null) removed.invalidateHttpSession();
    }

    public Map<String, GuestSessionRecord> snapshot() {
        return Map.copyOf(guests);
    }
}
