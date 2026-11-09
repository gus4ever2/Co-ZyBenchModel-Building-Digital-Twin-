package com.cozybench.guest;

import jakarta.servlet.http.HttpSession;

import java.time.Instant;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/** Temporary in-memory bookkeeping for one browser's guest session. */
public final class GuestSessionRecord {
    private final String guestSessionId;
    private final Instant createdAt;
    private final Set<String> simulationIds = ConcurrentHashMap.newKeySet();
    private volatile HttpSession httpSession;

    public GuestSessionRecord(String guestSessionId, HttpSession httpSession) {
        this.guestSessionId = guestSessionId;
        this.createdAt = Instant.now();
        this.httpSession = httpSession;
    }

    public String guestSessionId() {
        return guestSessionId;
    }

    public Instant createdAt() {
        return createdAt;
    }

    public Set<String> simulationIds() {
        return Set.copyOf(simulationIds);
    }

    public void addSimulation(String simulationId) {
        simulationIds.add(simulationId);
    }

    public void removeSimulation(String simulationId) {
        simulationIds.remove(simulationId);
    }

    public void refreshHttpSession(HttpSession session) {
        this.httpSession = session;
    }

    public void invalidateHttpSession() {
        HttpSession session = httpSession;
        if (session == null) return;
        try {
            session.invalidate();
        } catch (IllegalStateException ignored) {
            // It was already invalidated by the servlet container or another request.
        }
    }
}
