package com.example.cozybench.model.factory.materials;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.WindowMaterialTypeEnum;
import com.example.cozybench.model.factory.AbstractFactory;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import com.example.cozybench.model.validationRecords.materials.WindowGasPropertiesIdfObjectRecord;

import java.util.LinkedHashMap;
import java.util.Map;

public class WindowMaterialGasFactory extends AbstractFactory<WindowGasPropertiesIdfObjectRecord> {

    public WindowMaterialGasFactory(){
        super(WindowMaterialTypeEnum.WINDOW_MATERIAL_GAS);
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(Map<String, String> properties) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = WindowGasPropertiesIdfObjectRecord.builder()
                .Name(properties.get("Name"))
                .Gas_Type(properties.get("Gas_Type"))
                .Thickness(toDouble(properties.get("Thickness")))
                .Conductivity_Coefficient_A(toDouble(properties.get("Conductivity_Coefficient_A")))
                .Conductivity_Coefficient_B(toDouble(properties.get("Conductivity_Coefficient_B")))
                .Conductivity_Coefficient_C(toDouble(properties.get("Conductivity_Coefficient_C")))
                .Viscosity_Coefficient_A(toDouble(properties.get("Viscosity_Coefficient_A")))
                .Viscosity_Coefficient_B(toDouble(properties.get("Viscosity_Coefficient_B")))
                .Viscosity_Coefficient_C(toDouble(properties.get("Viscosity_Coefficient_C")))
                .Specific_Heat_Coefficient_A(toDouble(properties.get("Specific_Heat_Coefficient_A")))
                .Specific_Heat_Coefficient_B(toDouble(properties.get("Specific_Heat_Coefficient_B")))
                .Specific_Heat_Coefficient_C(toDouble(properties.get("Specific_Heat_Coefficient_C")))
                .Molecular_Weight(toDouble(properties.get("Molecular_Weight")))
                .Specific_Heat_Ratio(toDouble(properties.get("Specific_Heat_Ratio")))
                .build();

        records.put(record, WindowMaterialTypeEnum.WINDOW_MATERIAL_GAS);

        return records;
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createDefault(String name) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = WindowGasPropertiesIdfObjectRecord.builder()
                .Name(name)
                .Gas_Type("Air")
                .Thickness(0.1)
                .Conductivity_Coefficient_A(null)
                .Conductivity_Coefficient_B(null)
                .Conductivity_Coefficient_C(null)
                .Viscosity_Coefficient_A(0.1)
                .Viscosity_Coefficient_B(null)
                .Viscosity_Coefficient_C(null)
                .Specific_Heat_Coefficient_A(0.1)
                .Specific_Heat_Coefficient_B(null)
                .Specific_Heat_Coefficient_C(null)
                .Molecular_Weight(20.0)
                .Specific_Heat_Ratio(1.1)
                .build();

        records.put(record, WindowMaterialTypeEnum.WINDOW_MATERIAL_GAS);

        return records;
    }
}
