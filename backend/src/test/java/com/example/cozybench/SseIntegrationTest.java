package com.example.cozybench;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;
import java.time.Duration;

public class SseIntegrationTest {

    private static final String SSE_URL = "http://localhost:5000/real-time-data/{simulationId}";

    @Test
    void testMultipleSseConnections() {
        int numberOfClients = 5; // Simuler 5 connexions SSE simultanées
        String simulationId = "12345"; // Simulation ID factice

        // Création de plusieurs clients SSE
        Flux<String>[] clientFluxes = new Flux[numberOfClients];

        for (int i = 0; i < numberOfClients; i++) {
            WebClient webClient = WebClient.create();
            clientFluxes[i] = webClient.get()
                    .uri(SSE_URL, simulationId)
                    .accept(MediaType.TEXT_EVENT_STREAM)
                    .retrieve()
                    .bodyToFlux(String.class)  // Convertir en flux de chaînes JSON
                    .takeUntil(event -> event.contains("COMPLETED")) // Fermer après réception de "COMPLETED"
                    .timeout(Duration.ofSeconds(15)); // Timeout de sécurité
        }

        // Vérification que chaque client reçoit au moins 4 événements SSE
        for (Flux<String> clientFlux : clientFluxes) {
            StepVerifier.create(clientFlux)
                    .expectNextCount(4) // Vérifie que chaque connexion reçoit bien 4 événements
                    .thenConsumeWhile(event -> !event.contains("COMPLETED")) // Vérifie que les événements sont reçus
                    .verifyComplete();
        }
    }
}
