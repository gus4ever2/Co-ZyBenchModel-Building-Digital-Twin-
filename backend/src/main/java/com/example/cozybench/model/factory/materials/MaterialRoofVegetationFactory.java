package com.example.cozybench.model.factory.materials;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.MaterialTypeEnum;
import com.example.cozybench.model.factory.AbstractFactory;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import com.example.cozybench.model.validationRecords.materials.RoofVegetationPropertiesIdfObjectRecord;

import java.util.LinkedHashMap;
import java.util.Map;

public class MaterialRoofVegetationFactory extends AbstractFactory<RoofVegetationPropertiesIdfObjectRecord> {

    public MaterialRoofVegetationFactory(){
        super(MaterialTypeEnum.MATERIAL_ROOF_VEGETATION);
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(Map<String, String> properties) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = RoofVegetationPropertiesIdfObjectRecord.builder()
                .Name(properties.get("Name"))
                .Height_of_Plants(toDouble(properties.get("Height_of_Plants")))
                .Leaf_Area_Index(toDouble(properties.get("Leaf_Area_Index")))
                .Leaf_Reflectivity(toDouble(properties.get("Leaf_Reflectivity")))
                .Leaf_Emissivity(toDouble(properties.get("Leaf_Emissivity")))
                .Minimum_Stomatal_Resistance(toDouble(properties.get("Minimum_Stomatal_Resistance")))
                .Soil_Layer_Name(properties.get("Soil_Layer_Name"))
                .Roughness(properties.get("Roughness"))
                .Thickness(toDouble(properties.get("Thickness")))
                .Conductivity_of_Dry_Soil(toDouble(properties.get("Conductivity_of_Dry_Soil")))
                .Density_of_Dry_Soil(toDouble(properties.get("Density_of_Dry_Soil")))
                .Specific_Heat_of_Dry_Soil(toDouble(properties.get("Specific_Heat_of_Dry_Soil")))
                .Thermal_Absorptance(toDouble(properties.get("Thermal_Absorptance")))
                .Solar_Absorptance(toDouble(properties.get("Solar_Absorptance")))
                .Visible_Absorptance(toDouble(properties.get("Visible_Absorptance")))
                .Saturation_Volumetric_Moisture_Content_of_the_Soil_Layer(toDouble(properties.get("Saturation_Volumetric_Moisture_Content_of_the_Soil_Layer")))
                .Residual_Volumetric_Moisture_Content_of_the_Soil_Layer(toDouble(properties.get("Residual_Volumetric_Moisture_Content_of_the_Soil_Layer")))
                .Initial_Volumetric_Moisture_Content_of_the_Soil_Layer(toDouble(properties.get("Initial_Volumetric_Moisture_Content_of_the_Soil_Layer")))
                .Moisture_Diffusion_Calculation_Method(properties.get("Moisture_Diffusion_Calculation_Method"))
                .build();

        records.put(record, MaterialTypeEnum.MATERIAL_ROOF_VEGETATION);

        return records;
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createDefault(String name) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = RoofVegetationPropertiesIdfObjectRecord.builder()
                .Name(name)
                .Height_of_Plants(0.2)
                .Leaf_Area_Index(1.0)
                .Leaf_Reflectivity(0.22)
                .Leaf_Emissivity(0.95)
                .Minimum_Stomatal_Resistance(180.0)
                .Soil_Layer_Name("Green Roof Soil")
                .Roughness("MediumRough")
                .Thickness(0.1)
                .Conductivity_of_Dry_Soil(0.35)
                .Density_of_Dry_Soil(1100.0)
                .Specific_Heat_of_Dry_Soil(1200.0)
                .Thermal_Absorptance(0.9)
                .Solar_Absorptance(0.7)
                .Visible_Absorptance(0.75)
                .Saturation_Volumetric_Moisture_Content_of_the_Soil_Layer(0.3)
                .Residual_Volumetric_Moisture_Content_of_the_Soil_Layer(0.01)
                .Initial_Volumetric_Moisture_Content_of_the_Soil_Layer(0.1)
                .Moisture_Diffusion_Calculation_Method("Advanced")
                .build();

        records.put(record, MaterialTypeEnum.MATERIAL_ROOF_VEGETATION);

        return records;
    }
}
