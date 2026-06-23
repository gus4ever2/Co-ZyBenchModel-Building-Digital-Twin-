package com.example.cozybench.model.factory.materials;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.WindowMaterialTypeEnum;
import com.example.cozybench.model.factory.AbstractFactory;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import com.example.cozybench.model.validationRecords.materials.WindowDaylightRedirectionDevicePropertiesIdfObjectRecord;

import java.util.LinkedHashMap;
import java.util.Map;

public class WindowMaterialDaylightRedirectionDeviceFactory extends AbstractFactory<WindowDaylightRedirectionDevicePropertiesIdfObjectRecord> {

    public WindowMaterialDaylightRedirectionDeviceFactory(){
        super(WindowMaterialTypeEnum.WINDOW_MATERIAL_DAYLIGHT_REDIRECTION_DEVICE);
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(Map<String, String> properties) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = WindowDaylightRedirectionDevicePropertiesIdfObjectRecord.builder()
                .Name(properties.get("Name"))
                .build();

        records.put(record, WindowMaterialTypeEnum.WINDOW_MATERIAL_DAYLIGHT_REDIRECTION_DEVICE);

        return records;
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createDefault(String name) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = WindowDaylightRedirectionDevicePropertiesIdfObjectRecord.builder()
                .Name(name)
                .build();

        records.put(record, WindowMaterialTypeEnum.WINDOW_MATERIAL_DAYLIGHT_REDIRECTION_DEVICE);

        return records;
    }
}
