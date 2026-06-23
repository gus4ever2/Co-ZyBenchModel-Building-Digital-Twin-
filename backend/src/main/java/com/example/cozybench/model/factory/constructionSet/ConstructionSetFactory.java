package com.example.cozybench.model.factory.constructionSet;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.ConstructionSetTypeEnum;
import com.example.cozybench.model.factory.AbstractFactory;
import com.example.cozybench.model.validationRecords.ConstructionSetRecord;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import org.springframework.stereotype.Component;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class ConstructionSetFactory extends AbstractFactory<ConstructionSetRecord> {

    public ConstructionSetFactory() {
        super(ConstructionSetTypeEnum.CONSTRUCTION_SET);
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(Map<String, String> properties) {
        ConstructionSetRecord record =
                ConstructionSetRecord.builder()
                        .Name(properties.get("Name"))

                        .exteriorWall(properties.get("exteriorWall"))
                        .exteriorFloor(properties.get("exteriorFloor"))
                        .exteriorRoof(properties.get("exteriorRoof"))

                        .interiorWall(properties.get("interiorWall"))
                        .interiorFloor(properties.get("interiorFloor"))
                        .interiorCeiling(properties.get("interiorCeiling"))

                        .groundContactWall(properties.get("groundContactWall"))
                        .groundContactFloor(properties.get("groundContactFloor"))
                        .groundContactCeiling(properties.get("groundContactCeiling"))

                        .exteriorFixedWindow(properties.get("exteriorFixedWindow"))
                        .exteriorOperableWindow(properties.get("exteriorOperableWindow"))
                        .exteriorDoor(properties.get("exteriorDoor"))
                        .exteriorGlassDoor(properties.get("exteriorGlassDoor"))
                        .exteriorOverheadDoor(properties.get("exteriorOverheadDoor"))
                        .exteriorSkylight(properties.get("exteriorSkylight"))
                        .exteriorTubularDaylightDome(properties.get("exteriorTubularDaylightDome"))
                        .exteriorTubularDaylightDiffuser(properties.get("exteriorTubularDaylightDiffuser"))

                        .interiorFixedWindow(properties.get("interiorFixedWindow"))
                        .interiorOperableWindow(properties.get("interiorOperableWindow"))
                        .interiorDoor(properties.get("interiorDoor"))

                        .spaceShading(properties.get("spaceShading"))
                        .buildingShading(properties.get("buildingShading"))
                        .siteShading(properties.get("siteShading"))

                        .interiorPartition(properties.get("interiorPartition"))
                        .adiabaticSurface(properties.get("adiabaticSurface"))
                        .build();

        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        records.put(record, ConstructionSetTypeEnum.CONSTRUCTION_SET);

        return records;
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createDefault(String name) {
        ConstructionSetRecord record =
                ConstructionSetRecord.builder()
                        .Name(name)

                        .exteriorWall(null)
                        .exteriorFloor(null)
                        .exteriorRoof(null)

                        .interiorWall(null)
                        .interiorFloor(null)
                        .interiorCeiling(null)

                        .groundContactWall(null)
                        .groundContactFloor(null)
                        .groundContactCeiling(null)

                        .exteriorFixedWindow(null)
                        .exteriorOperableWindow(null)
                        .exteriorDoor(null)
                        .exteriorGlassDoor(null)
                        .exteriorOverheadDoor(null)
                        .exteriorSkylight(null)
                        .exteriorTubularDaylightDome(null)
                        .exteriorTubularDaylightDiffuser(null)

                        .interiorFixedWindow(null)
                        .interiorOperableWindow(null)
                        .interiorDoor(null)

                        .spaceShading(null)
                        .buildingShading(null)
                        .siteShading(null)

                        .interiorPartition(null)
                        .adiabaticSurface(null)
                        .build();

        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        records.put(record, ConstructionSetTypeEnum.CONSTRUCTION_SET);

        return records;
    }
}