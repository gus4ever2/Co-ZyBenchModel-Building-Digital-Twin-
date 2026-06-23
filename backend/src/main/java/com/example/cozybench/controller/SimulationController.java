package com.example.cozybench.controller;

import java.lang.reflect.Type;
import java.util.*;

import com.example.cozybench.service.LoadSpaceTypesService;
import com.example.cozybench.service.constructionSet.LoadConstructionSetToTempService;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.cozybench.dto.SimulationWithScenario;
import com.example.cozybench.model.Scenario;
import com.example.cozybench.model.Simulation;
import com.example.cozybench.model.SimulationRequest;
import com.example.cozybench.model.SimulationResponse;
import com.example.cozybench.model.SimulationStatus;
import com.example.cozybench.model.User;
import com.example.cozybench.repository.ScenarioRepository;
import com.example.cozybench.service.SimulationService;
import com.example.cozybench.service.UserService;

//@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/simulations")
@RequiredArgsConstructor
public class SimulationController {
    private final SimulationService simulationService;
    private final ScenarioRepository scenarioRepository;
    private final UserService userService;
    private final LoadConstructionSetToTempService loadConstructionSetToTempService;
    private final LoadSpaceTypesService loadSpaceTypesService;

    @GetMapping("/all")
    public ResponseEntity<List<Simulation>> getAllSimulations() {
        List<Simulation> simulations = simulationService.getAllSimulations();
        return ResponseEntity.ok(simulations);
    }

    /*@PostMapping("/create")
    public ResponseEntity<Simulation> createSimulation(@RequestBody Simulation simulation) {
        simulation.setStatus(SimulationStatus.fromString("PENDING"));
        simulation.setStartTime(OffsetDateTime.now());
        Simulation savedSimulation = simulationService.saveSimulation(simulation);
        return new ResponseEntity<>(savedSimulation, HttpStatus.CREATED);
    }*/

    @GetMapping("/{id}")
    public ResponseEntity<Simulation> getSimulationById(@PathVariable String id) {
        Optional<Simulation> simulation = simulationService.getSimulationById(id);
        return simulation.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Simulation>> getSimulationsByStatus(@PathVariable String status) {
        SimulationStatus simulationStatus = SimulationStatus.valueOf(status.toUpperCase());
        List<Simulation> simulations = simulationService.getSimulationsByStatus(simulationStatus);
        return ResponseEntity.ok(simulations);
    }
    /**
     * Start a simulation and store it in the database.
     */
    @PostMapping("/start-simulation")
    public ResponseEntity<SimulationResponse> startSimulation(
            Authentication authentication,
            @RequestParam("building") String building,
            @RequestParam("constructionSet") String constructionSet,
            @RequestParam("spaces") String spacesJson,
            @RequestParam("environment") String environment,
            @RequestParam("hvacSystem") String hvacSystem,
            @RequestParam(value = "pythonFile", required = false) MultipartFile pythonFile
            ) {
        try {
            Optional<User> userOptional = userService.findByEmail(authentication.getName());
            if (!userOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            User user = userOptional.get();

            Scenario scenario =  Scenario.builder()
                    .building(building)
                    .constructionSet(constructionSet)
                    .envConditions(environment)
                    .hvacSystem(hvacSystem)
                    .build();

            Scenario savedScenario = scenarioRepository.save(scenario);

            SimulationRequest request = SimulationRequest.builder()
                    .scenarioId(savedScenario.id())
                    .userEmail(authentication.getName())
                    .building(building)
                    .constructionSet(constructionSet)
                    .environment(environment)
                    .hvacSystem(hvacSystem).build();

            //this.loadConstructionSetToTempService.loadConstructionSet(authentication.getName(), constructionSet);
            this.loadSpaceTypesService.findEverySchedule(authentication.getName(), spacesJson);

            SimulationResponse simulationResponseFromPython = simulationService.startSimulation(request, pythonFile);
            System.out.println("Simulation started successfully: " + simulationResponseFromPython);

            if (simulationResponseFromPython != null && simulationResponseFromPython.getsimulationId() != null) {
                // Ajouter l'ID de la simulation à la liste des simulations de l'utilisateur
                user.addSimulationId(simulationResponseFromPython.getsimulationId());
                userService.save(user); // Sauvegarde les modifications
            }

            return new ResponseEntity<>(simulationResponseFromPython, HttpStatus.CREATED);
        } catch (Exception e) {
            System.out.println("Error during simulation start: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{simulationId}/status")
    public ResponseEntity<Map<String, Object>> getSimulationStatus(@PathVariable String simulationId) {
        System.out.println("Received simulationId: " + simulationId);
        Optional<Simulation> simulation = simulationService.getSimulationById(simulationId);

        if (simulation.isPresent()) {
            Simulation sim = simulation.get();
            Map<String, Object> response = new HashMap<>();
            response.put("status", sim.getStatus());
            response.put("progress", sim.getProgress());
            response.put("estimated_time", sim.getEstimatedCompletionTime());

            return ResponseEntity.ok(response);
        } else {
            System.out.println("Simulation not found for ID: " + simulationId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping("/{simulationId}/results")
    public ResponseEntity<?> getSimulationResults(@PathVariable String simulationId) {
        Optional<Simulation> simulation = simulationService.getSimulationById(simulationId);
        
        if (simulation.isPresent()) {
            // Assuming `results` is stored as a JSON array in the database
            return ResponseEntity.ok(simulation.get().getResults());
        }
    
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                             .body("Simulation results not found for ID: " + simulationId);
    }

    @GetMapping("/users/{email}/simulations")
    public ResponseEntity<List<SimulationWithScenario>> getUserSimulations(@PathVariable String email) {
        Optional<User> userOptional = userService.findByEmail(email);
        if (!userOptional.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        User user = userOptional.get();
        List<SimulationWithScenario> simulationsWithScenarios = simulationService.getSimulationsWithScenarios(user.getSimulationIds());

        return ResponseEntity.ok(simulationsWithScenarios);
    }
    

}

