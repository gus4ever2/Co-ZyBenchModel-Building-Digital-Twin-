package com.example.cozybench.model.validationRecords.plants;

import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record YPlantQmcSimulationPropertiesRecord(

        @NotNull(message = "Name cannot be null")
        String Name,

        Integer Start,

        Integer End,

        Integer Step,

        Integer Nsteps,

        String Output

) implements IdfObjectRecord {
}
