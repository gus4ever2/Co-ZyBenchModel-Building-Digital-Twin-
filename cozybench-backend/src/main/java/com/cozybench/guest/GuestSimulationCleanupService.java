package com.cozybench.guest;

import com.cozybench.simulation.service.SimulationService;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;

/** Deletes every simulation without an email owner at the configured daily time. */
@Service
public class GuestSimulationCleanupService {
    private static final Logger LOGGER =
            LoggerFactory.getLogger(GuestSimulationCleanupService.class);
    private static final String SIMULATIONS = "simulations";

    private final MongoTemplate mongo;
    private final SimulationService simulations;
    private final GuestSessionRegistry sessions;
    private final AtomicBoolean running = new AtomicBoolean();

    public GuestSimulationCleanupService(
            MongoTemplate mongo,
            SimulationService simulations,
            GuestSessionRegistry sessions
    ) {
        this.mongo = mongo;
        this.simulations = simulations;
        this.sessions = sessions;
    }

    @Scheduled(
            cron = "${cozybench.guest.cleanup.cron:0 0 3 * * *}",
            zone = "${cozybench.guest.cleanup.zone:Europe/Athens}"
    )
    public void cleanupAtThreeAm() {
        if (!running.compareAndSet(false, true)) return;

        Set<String> failedSimulationIds = new HashSet<>();
        try {
            var ownerless = mongo.find(
                    Query.query(Criteria.where("user_email").is(null)),
                    Document.class,
                    SIMULATIONS
            );
            for (Document document : ownerless) {
                String simulationId = id(document.get("_id"));
                if (simulationId == null) continue;
                try {
                    simulations.deleteUnownedSimulation(simulationId);
                    LOGGER.info("Cleaned ownerless simulation {}", simulationId);
                } catch (Exception error) {
                    failedSimulationIds.add(simulationId);
                    LOGGER.error(
                            "Could not clean ownerless simulation {}; keeping its records for retry",
                            simulationId,
                            error
                    );
                }
            }

            for (var entry : sessions.snapshot().entrySet()) {
                boolean hasFailedSimulation = entry.getValue().simulationIds().stream()
                        .anyMatch(failedSimulationIds::contains);
                if (!hasFailedSimulation) sessions.removeGuest(entry.getKey());
            }
        } finally {
            running.set(false);
        }
    }

    private String id(Object value) {
        if (value instanceof ObjectId objectId) return objectId.toHexString();
        return value == null ? null : String.valueOf(value);
    }
}
