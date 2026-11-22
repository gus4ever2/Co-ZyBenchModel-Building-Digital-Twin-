package com.cozybench.guest;

import com.cozybench.simulation.service.SimulationService;
import com.cozybench.simulation.service.CosimulatorSimulationClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicBoolean;

/** Deletes all user-created simulation data at the configured daily time. */
@Service
public class GuestSimulationCleanupService {
    private static final Logger LOGGER =
            LoggerFactory.getLogger(GuestSimulationCleanupService.class);
    private static final String WORKSPACE_COMPONENTS = "workspaceComponent";

    private final MongoTemplate mongo;
    private final SimulationService simulations;
    private final CosimulatorSimulationClient cosimulator;
    private final GuestSessionRegistry sessions;
    private final AtomicBoolean running = new AtomicBoolean();

    public GuestSimulationCleanupService(
            MongoTemplate mongo,
            SimulationService simulations,
            CosimulatorSimulationClient cosimulator,
            GuestSessionRegistry sessions
    ) {
        this.mongo = mongo;
        this.simulations = simulations;
        this.cosimulator = cosimulator;
        this.sessions = sessions;
    }

    @Scheduled(
            cron = "${cozybench.guest.cleanup.cron:0 0 3 * * *}",
            zone = "${cozybench.guest.cleanup.zone:Europe/Athens}"
    )
    public void cleanupAtThreeAm() {
        if (!running.compareAndSet(false, true)) return;

        try {
            var result = cosimulator.cleanupUserData();
            long workspaceComponents = mongo.collectionExists(WORKSPACE_COMPONENTS)
                    ? mongo.remove(new Query(), WORKSPACE_COMPONENTS).getDeletedCount()
                    : 0;
            simulations.clearResultCache();
            sessions.clear();
            LOGGER.info(
                    "Nightly user-data cleanup completed: {} workspace components removed; Python cleanup={}",
                    workspaceComponents,
                    result
            );
        } catch (Exception error) {
            LOGGER.error(
                    "Nightly user-data cleanup failed; data was left for the next retry",
                    error
            );
        } finally {
            running.set(false);
        }
    }
}
