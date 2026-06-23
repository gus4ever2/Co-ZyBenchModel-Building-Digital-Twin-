package com.example.cozybench.repository;

import com.example.cozybench.model.Scenario;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ScenarioRepository extends MongoRepository<Scenario, String> {


}
