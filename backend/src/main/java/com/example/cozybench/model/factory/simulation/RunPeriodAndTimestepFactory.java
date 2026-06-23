package com.example.cozybench.model.factory.simulation;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.SimulationTypeEnum;
import com.example.cozybench.model.factory.AbstractFactory;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import com.example.cozybench.model.validationRecords.simulation.RunPeriodPropertiesIdfObjectRecord;
import com.example.cozybench.model.validationRecords.simulation.TimestepPropertiesIdfObjectRecord;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class RunPeriodAndTimestepFactory extends AbstractFactory<IdfObjectRecord> {

    public RunPeriodAndTimestepFactory() {
        super(SimulationTypeEnum.RUN_PERIOD_AND_TIMESTEP);
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(Map<String, String> properties) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord runPeriodRecord = RunPeriodPropertiesIdfObjectRecord.builder()
                        .Name(properties.get("Name"))
                        .Begin_Month(toInteger(properties.get("Begin_Month")))
                        .Begin_Day_of_Month(toInteger(properties.get("Begin_Day_of_Month")))
                        .Begin_Year(toInteger(properties.get("Begin_Year")))
                        .End_Month(toInteger(properties.get("End_Month")))
                        .End_Day_of_Month(toInteger(properties.get("End_Day_of_Month")))
                        .End_Year(toInteger(properties.get("End_Year")))
                        .Day_of_Week_for_Start_Day(properties.get("Day_of_Week_for_Start_Day"))
                        .Use_Weather_File_Holidays_and_Special_Days(properties.get("Use_Weather_File_Holidays_and_Special_Days"))
                        .Use_Weather_File_Daylight_Saving_Period(properties.get("Use_Weather_File_Daylight_Saving_Period"))
                        .Apply_Weekend_Holiday_Rule(properties.get("Apply_Weekend_Holiday_Rule"))
                        .Use_Weather_File_Rain_Indicators(properties.get("Use_Weather_File_Rain_Indicators"))
                        .Use_Weather_File_Snow_Indicators(properties.get("Use_Weather_File_Snow_Indicators"))
                        .build();

        IdfObjectRecord timestepRecord = TimestepPropertiesIdfObjectRecord.builder()
                        .Number_of_Timesteps_per_Hour(
                                toInteger(properties.get("Number_of_Timesteps_per_Hour"))
                        )
                        .build();

        records.put(runPeriodRecord, SimulationTypeEnum.RUN_PERIOD);
        records.put(timestepRecord, SimulationTypeEnum.TIMESTEP);

        return records;
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createDefault(String name) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord runPeriodRecord = RunPeriodPropertiesIdfObjectRecord.builder()
                        .Name("Run Period 1")
                        .Begin_Month(1)
                        .Begin_Day_of_Month(1)
                        .Begin_Year(2010)
                        .End_Month(12)
                        .End_Day_of_Month(31)
                        .End_Year(2010)
                        .Day_of_Week_for_Start_Day("Friday")
                        .Use_Weather_File_Holidays_and_Special_Days("No")
                        .Use_Weather_File_Daylight_Saving_Period("No")
                        .Apply_Weekend_Holiday_Rule("No")
                        .Use_Weather_File_Rain_Indicators("Yes")
                        .Use_Weather_File_Snow_Indicators("Yes")
                        .build();

        IdfObjectRecord timestepRecord = TimestepPropertiesIdfObjectRecord.builder()
                        .Number_of_Timesteps_per_Hour(2)
                        .build();

        records.put(runPeriodRecord, SimulationTypeEnum.RUN_PERIOD);
        records.put(timestepRecord, SimulationTypeEnum.TIMESTEP);

        return records;
    }
}