package com.example.cozybench.model.factory.constructions;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.ConstructionTypeEnum;
import com.example.cozybench.model.factory.AbstractFactory;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import com.example.cozybench.model.validationRecords.constructions.ConstructionPropertyInternalHeatSourcePropertiesIdfObjectRecord;

import java.util.LinkedHashMap;
import java.util.Map;

public class ConstructionPropertyInternalHeatSourceFactory extends AbstractFactory<ConstructionPropertyInternalHeatSourcePropertiesIdfObjectRecord> {

    public ConstructionPropertyInternalHeatSourceFactory() {
        super(ConstructionTypeEnum.CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE);
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(Map<String, String> properties) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = ConstructionPropertyInternalHeatSourcePropertiesIdfObjectRecord.builder()
                .Name(properties.get("Name"))
                .Construction_Name(properties.get("Construction_Name"))
                .Thermal_Source_Present_After_Layer_Number(toInteger(properties.get("Thermal_Source_Present_After_Layer_Number")))
                .Temperature_Calculation_Requested_After_Layer_Number(toInteger(properties.get("Temperature_Calculation_Requested_After_Layer_Number")))
                .Dimensions_for_the_CTF_Calculation(toInteger(properties.get("Dimensions_for_the_CTF_Calculation")))
                .Tube_Spacing(toDouble(properties.get("Tube_Spacing")))
                .Two_Dimensional_Temperature_Calculation_Position(toDouble(properties.get("Two_Dimensional_Temperature_Calculation_Position")))
                .build();

        records.put(record, ConstructionTypeEnum.CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE);

        return records;
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createDefault(String constructionName) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        String name = constructionName + "value";

        IdfObjectRecord record = ConstructionPropertyInternalHeatSourcePropertiesIdfObjectRecord.builder()
                .Name(name)
                .Construction_Name(constructionName)
                .Thermal_Source_Present_After_Layer_Number(1)
                .Temperature_Calculation_Requested_After_Layer_Number(1)
                .Dimensions_for_the_CTF_Calculation(1)
                .Tube_Spacing(0.15)
                .Two_Dimensional_Temperature_Calculation_Position(0.5)
                .build();

        records.put(record, ConstructionTypeEnum.CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE);

        return records;
    }
}
