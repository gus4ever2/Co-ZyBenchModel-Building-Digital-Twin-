package com.example.cozybench.model.factory.materials;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.MaterialTypeEnum;
import com.example.cozybench.model.factory.AbstractFactory;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import com.example.cozybench.model.validationRecords.materials.PropertiesIdfObjectRecord;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class MaterialFactory extends AbstractFactory<PropertiesIdfObjectRecord> {

    public MaterialFactory(){
        super(MaterialTypeEnum.MATERIAL);
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(Map<String, String> properties) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = PropertiesIdfObjectRecord.builder()
                .Name(properties.get("Name"))
                .Roughness(properties.get("Roughness"))
                .Thickness(toDouble(properties.get("Thickness")))
                .Conductivity(toDouble(properties.get("Conductivity")))
                .Density(toDouble(properties.get("Density")))
                .Specific_Heat(toDouble(properties.get("Specific_Heat")))
                .Thermal_Absorptance(toDouble(properties.get("Thermal_Absorptance")))
                .Solar_Absorptance(toDouble(properties.get("Solar_Absorptance")))
                .Visible_Absorptance(toDouble(properties.get("Visible_Absorptance")))
                .build();

        records.put(record, MaterialTypeEnum.MATERIAL);

        return records;
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createDefault(String name) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = PropertiesIdfObjectRecord.builder()
                .Name(name)
                .Roughness("VeryRough")
                .Thickness(0.1)
                .Conductivity(0.1)
                .Density(0.1)
                .Specific_Heat(100.0)
                .Thermal_Absorptance(0.9)
                .Solar_Absorptance(0.7)
                .Visible_Absorptance(0.7)
                .build();

        records.put(record, MaterialTypeEnum.MATERIAL);

        return records;
    }
}
