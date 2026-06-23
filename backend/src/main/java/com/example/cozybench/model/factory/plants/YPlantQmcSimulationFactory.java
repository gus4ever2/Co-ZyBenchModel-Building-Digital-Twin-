package com.example.cozybench.model.factory.plants;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.PlantEnum;
import com.example.cozybench.model.factory.AbstractFactory;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import com.example.cozybench.model.validationRecords.plants.YPlantQmcSimulationPropertiesRecord;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class YPlantQmcSimulationFactory
        extends AbstractFactory<YPlantQmcSimulationPropertiesRecord> {

    public YPlantQmcSimulationFactory() {
        super(PlantEnum.PLANT_YPLANT_QMC_CO2_SIMULATION);
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(Map<String, String> properties) {
        YPlantQmcSimulationPropertiesRecord record =
                YPlantQmcSimulationPropertiesRecord.builder()
                        .Name(properties.get("Name"))
                        .Start(toInteger(properties.get("Start")))
                        .End(toInteger(properties.get("End")))
                        .Step(toInteger(properties.get("Step")))
                        .Nsteps(toInteger(properties.get("Nsteps")))
                        .Output(properties.get("Output"))
                        .build();

        return Map.of(record, getType());
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createDefault(String name) {
        YPlantQmcSimulationPropertiesRecord record =
                YPlantQmcSimulationPropertiesRecord.builder()
                        .Name(name)
                        .Start(400)
                        .End(2500)
                        .Step(100)
                        .Nsteps(24)
                        .Output("tartu_aug21_co2_absorption.json")
                        .build();

        return Map.of(record, getType());
    }
}