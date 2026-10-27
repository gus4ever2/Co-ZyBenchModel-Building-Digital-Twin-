import api, { buildingDtApi } from "../../lib/api";
import type { Descriptor } from "../construction-sets/constructionSetService";
import type { SimulationListItem } from "../simulations/simulationsService";

type DescriptorState = {
  componentDescriptions?: { componentParts?: Descriptor[] };
  libraryDescriptions?: { componentParts?: Descriptor[] };
};

type PlantListResponse = {
  plants?: Array<{ id: string; name: string; status: string; defaultOption?: boolean }>;
};

export type NewSimulationPayload = {
  name: string;
  location: string;
  constructionSet: string;
  plantsEnabled: boolean;
  plantId?: string;
  plantName?: string;
  greenWallSize?: "SMALL" | "MEDIUM" | "LARGE" | "VERY_LARGE";
  lightingLevel?: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  exchangeMode?: "FULL_EXCHANGE" | "UPTAKE_ONLY";
  openWindowsEnabled: boolean;
  openingStrategy?: "LINEAR" | "ON_OFF";
  minCo2Level?: 500 | 600 | 700 | 800 | 900 | 1000;
  temperatureMargin?: number;
  co2ControlEnabled: boolean;
  co2SetpointPpm?: 500 | 600 | 700 | 800 | 900 | 1000;
};

export const CO2_CONTROL_SETPOINT_OPTIONS = [
  500, 600, 700, 800, 900, 1000,
] as const;

export type CustomSimulationPayload = {
  name: string;
  city: string;
  constructionSet: string;
  configuration: Record<string, unknown>;
};

function descriptors(data: DescriptorState) {
  return data.componentDescriptions?.componentParts ?? [];
}

export async function loadSimulationConstructionSets() {
  const { data } = await buildingDtApi.get<DescriptorState>(
    "/loadConstructionSetsData",
    { params: { id: "0" } },
  );
  return [
    ...(data.libraryDescriptions?.componentParts ?? []).map(item => ({
      ...item, defaultOption: true,
    })),
    ...descriptors(data).filter(item => !item.defaultOption),
  ];
}

// Numeric climate zones describe temperature, not humidity (A/B/C).
// Labels follow DOE's thermal climate-zone naming.
export function constructionSetClimateDescription(name: string): string {
  const zone = /_CZ([0-9_]+)_/.exec(name)?.[1];
  const descriptions: Record<string, string> = {
    "1": "For very hot climates",
    "2": "For hot climates",
    "3": "For warm climates",
    "4": "For mixed climates",
    "5": "For cool climates",
    "6": "For cold climates",
    "7_8": "For very cold and subarctic climates",
  };
  return (zone && descriptions[zone]) || "Standard office construction set";
}

export async function loadSimulationPlants() {
  const [defaults, personal] = await Promise.all([
    api.get<PlantListResponse>("/v1/plants/defaults"),
    api.get<PlantListResponse>("/v1/plants"),
  ]);
  return [
    ...(defaults.data.plants ?? []).map(plant => ({ ...plant, defaultOption: true })),
    ...(personal.data.plants ?? []).map(plant => ({ ...plant, defaultOption: false })),
  ]
    .filter((plant) => plant.status === "COMPLETED")
    .map((plant) => ({ id: plant.id, name: plant.name, type: "PLANT", defaultOption: plant.defaultOption }));
}

export async function startSimulation(payload: NewSimulationPayload) {
  const { data } = await api.post<SimulationListItem>("/v1/simulations", {
    name: payload.name.trim(),
    scenarioType: "REFERENCE",
    city: payload.location,
    constructionSet: payload.constructionSet,
    plantSimulation: payload.plantsEnabled
      ? {
          plantId: payload.plantId,
          plantName: payload.plantName,
          greenWallSize: payload.greenWallSize ?? "MEDIUM",
          lightingLevel: payload.lightingLevel ?? "MEDIUM",
          exchangeMode: payload.exchangeMode ?? "FULL_EXCHANGE",
        }
      : null,
    openWindows: payload.openWindowsEnabled
      ? {
          openingStrategy: payload.openingStrategy ?? "LINEAR",
          temperatureMarginC: payload.temperatureMargin ?? 2,
          co2ThresholdPpm: payload.minCo2Level ?? 800,
        }
      : null,
    co2Control: payload.co2ControlEnabled
      ? {
          setpointPpm: payload.co2SetpointPpm ?? 800,
        }
      : null,
    customScenario: {},
  });
  return data;
}

export async function checkSimulationName(name: string) {
  const { data } = await api.get<{ available: boolean }>(
    "/v1/simulations/name-availability",
    { params: { name: name.trim() } },
  );
  return data.available;
}

export async function startCustomSimulation(payload: CustomSimulationPayload) {
  const { data } = await api.post<SimulationListItem>("/v1/simulations", {
    name: payload.name,
    scenarioType: "CUSTOM",
    city: payload.city,
    constructionSet: payload.constructionSet,
    plantSimulation: null,
    openWindows: null,
    co2Control: null,
    customScenario: payload.configuration,
  });
  return data;
}
