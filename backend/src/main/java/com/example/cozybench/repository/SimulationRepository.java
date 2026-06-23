package com.example.cozybench.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.cozybench.model.Simulation;
import com.example.cozybench.model.SimulationStatus;

@Repository
public interface SimulationRepository extends MongoRepository<Simulation, String> {
    

    List<Simulation> findByStatus(SimulationStatus status);

}
