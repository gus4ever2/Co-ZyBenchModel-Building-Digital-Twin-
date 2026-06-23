package com.example.cozybench.model.factory;

import com.example.cozybench.dto.constructionsDTO.ResponseAggregator.ResponseComponentDTO;
import com.example.cozybench.model.enums.MaterialTypeEnum;
import com.example.cozybench.model.validationRecords.materials.AirGapPropertiesIdfObjectRecord;
import com.example.cozybench.model.validationRecords.materials.InfraredTransparentPropertiesIdfObjectRecord;
import com.example.cozybench.model.validationRecords.materials.NoMassPropertiesIdfObjectRecord;
import com.example.cozybench.model.validationRecords.materials.PropertiesIdfObjectRecord;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class MaterialRecordFactory {

    public Object createRecord(ResponseComponentDTO dto) {

        MaterialTypeEnum type = MaterialTypeEnum.valueOf(dto.type());

        Map<String, String> p = dto.properties();

        return switch (type) {
            case MATERIAL -> new PropertiesIdfObjectRecord(
                    p.get("Name"),
                    p.get("Roughness"),
                    toDouble(p.get("Thickness")),
                    toDouble(p.get("Conductivity")),
                    toDouble(p.get("Density")),
                    toDouble(p.get("Specific_Heat")),
                    toDouble(p.get("Thermal_Absorptance")),
                    toDouble(p.get("Solar_Absorptance")),
                    toDouble(p.get("Visible_Absorptance"))
            );

            case MATERIAL_NO_MASS -> new NoMassPropertiesIdfObjectRecord(
                    p.get("Name"),
                    p.get("Roughness"),
                    toDouble(p.get("Thermal_Resistance")),
                    toDouble(p.get("Thermal_Absorptance")),
                    toDouble(p.get("Solar_Absorptance")),
                    toDouble(p.get("Visible_Absorptance"))
            );

            case MATERIAL_AIR_GAP -> new AirGapPropertiesIdfObjectRecord(
                    p.get("Name"),
                    toDouble(p.get("Thermal_Resistance"))
            );

            case MATERIAL_INFRARED_TRANSPARENT -> new InfraredTransparentPropertiesIdfObjectRecord(
                    p.get("Name")
            );



            default -> throw new RuntimeException("Record factory not implemented for: " + type);
        };
    }

    private Double toDouble(String value) {
        System.out.println(value);
        if (value == null || value.isBlank()) {
            throw new RuntimeException("Required number is missing");
        }

        return Double.valueOf(value);
    }

    private Double toDoubleOrNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return Double.valueOf(value);
    }
}
