package com.example.cozybench.controller.constructionSet;

import com.example.cozybench.dto.constructionsDTO.ResponseStateDTO;
import com.example.cozybench.service.PlantService;
import com.example.cozybench.service.constructionSet.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping(value="/constructions", produces="application/json")
public class ConstructionsController {
    private final MaterialService materialService;
    private final ConstructionService constructionService;
    private final ConstructionSetService constructionSetService;
    private final SimulationDataService simulationDataService;
    private final PlantDataService plantDataService;
    private final PlantService plantService;

    @GetMapping("/loadMaterialsData")
    public ResponseStateDTO getStateDTOMaterials(Authentication authentication, @RequestParam(defaultValue = "0") String id) {
        return materialService.getMaterialsFromTempRepository(authentication, id);
    }

    @GetMapping("/loadConstructionsData")
    public ResponseStateDTO getStateDTOConstructions(Authentication authentication, @RequestParam(defaultValue = "0") String id) {
        return this.constructionService.getConstructionsState(authentication.getName(), id);
    }

    @GetMapping("/loadConstructionSetsData")
    public ResponseStateDTO getStateDTOConstructionSets(Authentication authentication, @RequestParam(defaultValue = "0") String id) {
        return this.constructionSetService.getConstructionSetsState(authentication.getName(), id);
    }

    @GetMapping("/loadSimulationData")
    public ResponseStateDTO getStateDTOSimulation(Authentication authentication, @RequestParam(defaultValue = "0") String id) {
        return this.simulationDataService.getPeriodAndTimestep(authentication.getName(), id);
    }

    //@GetMapping("/loadPlantsData")
    //public ResponseStateDTO getStateDTOPlants(Authentication authentication, @RequestParam(defaultValue = "0") String id) {
        // this.plantDataService.getPlantsState(authentication.getName(), id);
    //}

    @PostMapping("/uploadPlantDT")
    public String uploadPlantDT(
            Authentication authentication,
            @RequestParam("plantName") String plantName,
            @RequestParam("leafFile") MultipartFile leafFile,
            @RequestParam("branchesFile") MultipartFile branchesFile
    ) {
        return this.plantService.createPlant(
                authentication.getName(),
                plantName,
                branchesFile,
                leafFile);
    }
}
