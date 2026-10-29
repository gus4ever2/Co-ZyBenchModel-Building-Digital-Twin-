import api from "../../lib/api";

export async function downloadSimulationJson(simulationId: string) {
  const response = await api.get<Blob>(`/v1/simulations/${simulationId}/export`, {
    responseType: "blob",
    timeout: 0,
  });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = `simulation-${simulationId}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Allow the browser to consume the Blob before releasing it.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export type PlantSimulation = {
  plantId?: string;
  plantName: string;
  greenWallSize?: "SMALL" | "MEDIUM" | "LARGE" | "VERY_LARGE" | null;
  lightingLevel: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  exchangeMode?: "FULL_EXCHANGE" | "UPTAKE_ONLY";
};

export type OpenWindows = {
  openingStrategy: "LINEAR" | "ON_OFF";
  temperatureMarginC: number;
  co2ThresholdPpm: number;
};

export type Co2Control = {
  setpointPpm: 500 | 600 | 700 | 800 | 900 | 1000;
};

export type ComponentSnapshot = {
  id: string;
  name: string;
  type: string;
  properties: Record<string, string | null>;
};

export type ConstructionSetSnapshot = {
  constructionSet: ComponentSnapshot;
  constructions: ComponentSnapshot[];
  materials: ComponentSnapshot[];
};

export type SimulationListItem = {
  id: string;
  name: string;
  scenarioType: "REFERENCE" | "CUSTOM";
  status: string;
  progress: number;
  city?: string;
  constructionSetName?: string;
  plantSimulation?: PlantSimulation | null;
  openWindows?: OpenWindows | null;
  co2Control?: Co2Control | null;
  thermostatSetpoints?: { heatingSetpointC: number; coolingSetpointC: number } | null;
  requestedAt?: string;
  startedAt?: string;
  completedAt?: string;
  resultStartTimestamp?: string;
  resultEndTimestamp?: string;
  timestepCount: number;
  error?: string;
  constructionSet?: ConstructionSetSnapshot | null;
  customScenario: Record<string, unknown>;
};

export type ZoneResult = {
  operative_temperature_c?: number | null;
  zone_name?: string;
  zone_air_temp_c?: number;
  mean_radiant_temperature_c?: number;
  co2_concentration_ppm?: number;
  co2_setpoint_ppm?: number;
  co2_predicted_load_kg_s?: number;
  relative_humidity_percent?: number;
  humidity_ratio_kg_water_per_kg_dry_air?: number;
  cooling_setpoint_c?: number;
  heating_setpoint_c?: number;
  occupant_count?: number;
  people_heat_gain_rate_w?: number;
  people_heat_gain_energy_j?: number;
  outdoor_air_transfer_rate_w?: number;
  outdoor_air_transfer_energy_j?: number;
  air_energy_storage_rate_w?: number;
  supply_air_temp_c?: number | null;
  supply_air_mass_flow_kg_s?: number | null;
  supply_air_co2_ppm?: number | null;
  supply_co2_mass_flow_g_s?: number | null;
  return_air_mass_flow_kg_s?: number | null;
  return_air_co2_ppm?: number | null;
  return_co2_mass_flow_g_s?: number | null;
};

export type SimulationTimestepResults = {
  total_floor_area_m2?: number | null;
  hvac_kwh_per_m2?: number | null;
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  outdoor_air_temp_c?: number;
  wind_speed_m_s?: number;
  barometric_pressure_pa?: number;
  outdoor_air_flow_fraction?: number;
  outdoor_air_flow_percent?: number | null;
  economizer_status?: number;
  zone_results?: Record<string, ZoneResult>;
  zone_internal_variable_values?: Record<
    string,
    {
      floor_area_m2?: number;
      net_wall_area_m2?: number;
      air_volume_m3?: number;
    }
  >;
  meter_results?: {
    heating_electricity_kwh?: number | null;
    cooling_electricity_kwh?: number | null;
    hvac_electricity_kwh?: number | null;
    heating_electricity_j?: number;
    cooling_electricity_j?: number;
    hvac_electricity_j?: number;
  } | null;
  window_opening_results?: Record<
    string,
    {
      zone_name?: string;
      window_results?: Array<{ window_name?: string; opening_factor?: number }>;
      mean_opening_percent?: number | null;
    }
  >;
  plant_co2_exchange_results?:
    | Record<string, PlantCo2ExchangeResult>
    | { plant_co2_exchange_results: Record<string, PlantCo2ExchangeResult> };
};

type PlantCo2ExchangeResult = {
  zone_name?: string;
  green_wall_area_m2?: number;
  total_leaf_area_m2?: number;
  net_co2_exchange_g_per_hour?: number;
  sink_volume_flow_rate_m3_s?: number;
  source_volume_flow_rate_m3_s?: number;
  ppfd_umol_m2_s?: number;
};

export type SimulationTimestep = {
  _id?: string;
  simulation_id?: string;
  timestep_number?: number;
  simulation_timestamp?: string;
  recorded_at?: string;
  results?: SimulationTimestepResults;
};

export type SimulationResultsResponse = {
  simulationId: string;
  offset: number;
  limit?: number;
  total: number;
  returned: number;
  timesteps: SimulationTimestep[];
};

export type Co2ComparisonPoint = {
  timestamp: string;
  ppm: number;
};

export type TemperatureComparisonPoint = {
  timestamp: string;
  temperatureC: number;
};

export type ThermalZoneComparison = {
  zoneName: string;
  deltaCo2Series: Co2ComparisonPoint[];
  deltaOperativeTemperatureSeries?: TemperatureComparisonPoint[];
  summary: {
    meanDeltaCo2Ppm: number;
    maxDeltaCo2Ppm: number;
    minDeltaCo2Ppm: number;
    meanDaytimeWeekdayDeltaCo2Ppm?: number | null;
    maxDaytimeWeekdayDeltaCo2Ppm?: number | null;
    minDaytimeWeekdayDeltaCo2Ppm?: number | null;
    meanNightWeekdayDeltaCo2Ppm?: number | null;
    averageCo2?: Co2AverageComparison | null;
    daytimeWeekdayAverageCo2?: Co2AverageComparison | null;
    nightWeekdayAverageCo2?: Co2AverageComparison | null;
  };
  operativeTemperatureSummary?: {
    meanDeltaOperativeTemperatureC: number;
    maxDeltaOperativeTemperatureC: number;
    minDeltaOperativeTemperatureC: number;
    meanMorningWeekdayDeltaOperativeTemperatureC?: number | null;
    maxMorningWeekdayDeltaOperativeTemperatureC?: number | null;
    minMorningWeekdayDeltaOperativeTemperatureC?: number | null;
  } | null;
};

export type Co2AverageComparison = {
  baselinePpm: number | null;
  comparedPpm: number | null;
  differencePercent: number | null;
};

export type ComparisonPlantConfiguration = {
  simulationId: string;
  simulationName: string;
  enabled: boolean;
  plantId?: string | null;
  plantName?: string | null;
  greenWallSize?: string | null;
  lightingLevel?: string | null;
  ppfdUmolM2S?: number | null;
  plantFileIdentifier?: string | null;
  leafFileIdentifier?: string | null;
  totalLeafAreaM2?: number | null;
  meanParLeafUmolM2S?: number | null;
  missingDataReason?: string | null;
};

export type SimulationReference = { id: string; name: string };

export type ScenarioComparison = {
  simulation: SimulationReference;
  thermalZones: ThermalZoneComparison[];
};

export type SimulationComparisonResponse = {
  analyticsBySimulation: Record<string, AnalyticsResponse>;
  baseline: SimulationReference;
  analysisRange: { start?: string | null; end?: string | null };
  comparisons: ScenarioComparison[];
  plantConfigurations: ComparisonPlantConfiguration[];
};

export type CurrentSimulationResponse = {
  simulation: SimulationListItem;
  latestTimestep: SimulationTimestep;
};

export type DashboardSummary = {
  total: number;
  openWindowSimulations: number;
  plantSimulations: number;
  co2ControlSimulations: number;
  constructionSets: number;
  constructions: number;
  plantModels: number;
  materials: number;
};

type SimulationListResponse = {
  count: number;
  simulations: SimulationListItem[];
};

export async function loadUserSimulations() {
  const { data } = await api.get<SimulationListResponse>("/v1/simulations");
  return data.simulations ?? [];
}

export async function loadSimulationHistory() {
  const { data } = await api.get<SimulationListResponse>(
    "/v1/simulations/history",
  );
  return data.simulations ?? [];
}

export async function loadSimulation(simulationId: string) {
  const { data } = await api.get<SimulationListItem>(
    `/v1/simulations/${simulationId}`,
  );
  return data;
}

export async function loadSimulationResults(simulationId: string) {
  const limit = 1000;
  const timesteps: SimulationTimestep[] = [];
  let total = 0;
  do {
    const { data } = await api.get<SimulationResultsResponse>(
      `/v1/simulations/${simulationId}/results`,
      { params: { offset: timesteps.length, limit } },
    );
    total = data.total;
    const page = data.timesteps ?? [];
    if (!page.length && timesteps.length < total) {
      throw new Error("Simulation results stopped loading before all timesteps were received.");
    }
    for (const step of page) timesteps.push(step);
  } while (timesteps.length < total);
  return { simulationId, offset: 0, total, returned: timesteps.length, timesteps };
}

export type AnalyticsResponse = {
  schemaVersion: number;
  simulationId: string;
  results: Record<string, unknown>;
  metrics: Record<string, number | null>;
  zones: Record<string, Record<string, number | null>>;
};

export async function loadSimulationAnalytics(simulationId: string, startIndex = 0, endIndex?: number) {
  const { data } = await api.get<AnalyticsResponse>(`/v1/simulations/${simulationId}/analytics`, {
    params: { startIndex, endIndex },
  });
  return data;
}

export async function loadSimulationComparison(
  simulationIds: string[],
  analysisStart?: string,
  analysisEnd?: string,
) {
  const { data } = await api.post<SimulationComparisonResponse>(
    "/v1/simulations/comparison",
    { simulationIds, analysisStart, analysisEnd },
  );
  return data;
}

export async function loadCurrentSimulation() {
  const response = await api.get<CurrentSimulationResponse | undefined>(
    "/v1/simulations/current",
  );
  return response.status === 204 ? null : (response.data ?? null);
}

export async function cancelSimulation(simulationId: string) {
  const { data } = await api.post<SimulationListItem>(
    `/v1/simulations/${simulationId}/cancel`,
  );
  return data;
}

export async function deleteSimulation(simulationId: string) {
  await api.delete(`/v1/simulations/${simulationId}`);
}

export async function loadDashboardSummary() {
  const { data } = await api.get<DashboardSummary>("/v1/dashboard/summary");
  return data;
}
