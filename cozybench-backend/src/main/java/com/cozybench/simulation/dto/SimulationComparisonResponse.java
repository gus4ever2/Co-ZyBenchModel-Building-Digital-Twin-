package com.cozybench.simulation.dto;

import java.util.List;

public record SimulationComparisonResponse(
        SimulationReference baseline,
        AnalysisRange analysisRange,
        List<ScenarioComparison> comparisons,
        List<PlantConfiguration> plantConfigurations
) {
    public SimulationComparisonResponse {
        comparisons = comparisons == null ? List.of() : List.copyOf(comparisons);
        plantConfigurations = plantConfigurations == null
                ? List.of()
                : List.copyOf(plantConfigurations);
    }

    public record SimulationReference(String id, String name) {
    }

    public record AnalysisRange(String start, String end) {
    }

    public record Co2Point(String timestamp, double ppm) {
    }

    public record TemperaturePoint(String timestamp, double temperatureC) {
    }

    public record Co2Summary(
            double meanDeltaCo2Ppm,
            double maxDeltaCo2Ppm,
            double minDeltaCo2Ppm,
            Double meanMorningWeekdayDeltaCo2Ppm,
            Double maxMorningWeekdayDeltaCo2Ppm,
            Double minMorningWeekdayDeltaCo2Ppm,
            Double meanMorningWeekdayDeltaCo2RatePpmPerHour,
            Double meanNightWeekdayDeltaCo2RatePpmPerHour,
            Double meanLightsOnDeltaCo2Ppm,
            Double meanLightsOffDeltaCo2Ppm
    ) {
    }

    public record OperativeTemperatureSummary(
            double meanDeltaOperativeTemperatureC,
            double maxDeltaOperativeTemperatureC,
            double minDeltaOperativeTemperatureC,
            Double meanMorningWeekdayDeltaOperativeTemperatureC,
            Double maxMorningWeekdayDeltaOperativeTemperatureC,
            Double minMorningWeekdayDeltaOperativeTemperatureC
    ) {
    }

    public record ThermalZoneComparison(
            String zoneName,
            List<Co2Point> deltaCo2Series,
            Co2Summary summary,
            List<TemperaturePoint> deltaOperativeTemperatureSeries,
            OperativeTemperatureSummary operativeTemperatureSummary
    ) {
        public ThermalZoneComparison {
            deltaCo2Series = deltaCo2Series == null
                    ? List.of()
                    : List.copyOf(deltaCo2Series);
            deltaOperativeTemperatureSeries = deltaOperativeTemperatureSeries == null
                    ? List.of()
                    : List.copyOf(deltaOperativeTemperatureSeries);
        }
    }

    public record ScenarioComparison(
            SimulationReference simulation,
            List<ThermalZoneComparison> thermalZones
    ) {
        public ScenarioComparison {
            thermalZones = thermalZones == null ? List.of() : List.copyOf(thermalZones);
        }
    }

    public record PlantConfiguration(
            String simulationId,
            String simulationName,
            boolean enabled,
            String plantId,
            String plantName,
            String greenWallSize,
            String lightingLevel,
            Double ppfdUmolM2S,
            String plantFileIdentifier,
            String leafFileIdentifier,
            Double totalLeafAreaM2,
            Double meanParLeafUmolM2S,
            String missingDataReason
    ) {
    }
}
