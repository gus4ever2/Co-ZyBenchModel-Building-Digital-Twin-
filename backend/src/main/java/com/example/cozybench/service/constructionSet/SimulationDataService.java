package com.example.cozybench.service.constructionSet;

import com.example.cozybench.dto.constructionsDTO.ResponseAggregator.ResponseComponentDTO;
import com.example.cozybench.dto.constructionsDTO.ResponseStateDTO;
import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.factory.simulation.RunPeriodAndTimestepFactory;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SimulationDataService {
    private final RunPeriodAndTimestepFactory runPeriodAndTimestepFactory;

    public ResponseStateDTO getPeriodAndTimestep(String userEmail, String id) {
        return ResponseStateDTO.builder()
                .component(this.createPeriodAndTimestep())
                .build();
    }

    private ResponseComponentDTO createPeriodAndTimestep() {
        Map<IdfObjectRecord, TypeEnumInterface> recordMap = runPeriodAndTimestepFactory.createDefault("Run Period 1");

        Gson gson = new Gson();
        LinkedHashMap<String, String> componentMap = new LinkedHashMap<>();

        recordMap.keySet().forEach(record -> {
        String json = gson.toJson(record);
                    componentMap.putAll(gson.fromJson(
                            json,
                            new TypeToken<Map<String, String>>() {
                            }.getType()
                    ));
                }
        );
        System.out.println(componentMap);
        return ResponseComponentDTO.builder()
                .type(runPeriodAndTimestepFactory.getType().toString())
                .properties(componentMap)
                .build();
    }

}
