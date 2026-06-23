package com.example.cozybench.model.validationRecords.simulation;

import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import lombok.Builder;

@Builder
public record RunPeriodPropertiesIdfObjectRecord(
        String Name,
        Integer Begin_Month,
        Integer Begin_Day_of_Month,
        Integer Begin_Year,
        Integer End_Month,
        Integer End_Day_of_Month,
        Integer End_Year,
        String Day_of_Week_for_Start_Day,
        String Use_Weather_File_Holidays_and_Special_Days,
        String Use_Weather_File_Daylight_Saving_Period,
        String Apply_Weekend_Holiday_Rule,
        String Use_Weather_File_Rain_Indicators,
        String Use_Weather_File_Snow_Indicators
) implements IdfObjectRecord {}
