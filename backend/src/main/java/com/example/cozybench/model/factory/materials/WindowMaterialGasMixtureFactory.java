package com.example.cozybench.model.factory.materials;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.WindowMaterialTypeEnum;
import com.example.cozybench.model.factory.AbstractFactory;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import com.example.cozybench.model.validationRecords.materials.WindowGasMixturePropertiesIdfObjectRecord;

import java.util.LinkedHashMap;
import java.util.Map;

public class WindowMaterialGasMixtureFactory extends AbstractFactory<WindowGasMixturePropertiesIdfObjectRecord> {

    public WindowMaterialGasMixtureFactory(){
        super(WindowMaterialTypeEnum.WINDOW_MATERIAL_GAS_MIXTURE);
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(Map<String, String> properties) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = WindowGasMixturePropertiesIdfObjectRecord.builder()
                .Name(properties.get("Name"))
                .Thickness(toDouble(properties.get("Thickness")))
                .Number_of_Gases_in_Mixture(toDouble(properties.get("Number_of_Gases_in_Mixture")))
                .Gas_1_Type(properties.get("Gas_1_Type"))
                .Gas_1_Fraction(toDouble(properties.get("Gas_1_Fraction")))
                .Gas_2_Type(properties.get("Gas_2_Type"))
                .Gas_2_Fraction(toDouble(properties.get("Gas_2_Fraction")))
                .Gas_3_Type(properties.get("Gas_3_Type"))
                .Gas_3_Fraction(toDouble(properties.get("Gas_3_Fraction")))
                .Gas_4_Type(properties.get("Gas_4_Type"))
                .Gas_4_Fraction(toDouble(properties.get("Gas_4_Fraction")))
                .build();

        records.put(record, WindowMaterialTypeEnum.WINDOW_MATERIAL_GAS_MIXTURE);

        return records;
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createDefault(String name) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = WindowGasMixturePropertiesIdfObjectRecord.builder()
                .Name(name)
                .Thickness(0.1)
                .Number_of_Gases_in_Mixture(1.0)
                .Gas_1_Type("Air")
                .Gas_1_Fraction(0.1)
                .Gas_2_Type("Air")
                .Gas_2_Fraction(0.1)
                .Gas_3_Type("Air")
                .Gas_3_Fraction(0.1)
                .Gas_4_Type("Air")
                .Gas_4_Fraction(0.1)
                .build();

        records.put(record, WindowMaterialTypeEnum.WINDOW_MATERIAL_GAS_MIXTURE);

        return records;
    }
}
