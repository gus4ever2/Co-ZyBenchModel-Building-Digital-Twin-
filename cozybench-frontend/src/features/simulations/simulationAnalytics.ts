import type { SimulationTimestep, ZoneResult } from "./simulationsService";

export type EnergyAggregation = "day" | "month";

export type EnergyAggregationPoint = {
  key: string;
  label: string;
  timestamp: number;
  heatingKwh: number | null;
  coolingKwh: number | null;
  hvacKwh: number | null;
};

/** Sum interval energy values into calendar-day or calendar-month buckets. */
export function aggregateEnergy(
  timesteps: SimulationTimestep[],
  aggregation: EnergyAggregation,
): EnergyAggregationPoint[] {
  const buckets = new Map<string, EnergyAggregationPoint>();
  for (const timestep of timesteps) {
    const date = timestep.simulation_timestamp
      ? new Date(timestep.simulation_timestamp)
      : null;
    if (!date || Number.isNaN(date.getTime())) continue;

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const key = aggregation === "day"
      ? `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      : `${year}-${String(month).padStart(2, "0")}`;
    const label = aggregation === "day"
      ? date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" })
      : date.toLocaleDateString(undefined, { year: "numeric", month: "short" });
    const timestamp = new Date(
      aggregation === "day" ? `${key}T00:00:00` : `${key}-01T00:00:00`,
    ).getTime();
    const meter = timestep.results?.meter_results;
    const bucket = buckets.get(key) ?? {
      key,
      label,
      timestamp,
      heatingKwh: 0,
      coolingKwh: 0,
      hvacKwh: 0,
    };
    if (typeof meter?.heating_electricity_kwh === "number") {
      bucket.heatingKwh = (bucket.heatingKwh ?? 0) + meter.heating_electricity_kwh;
    }
    if (typeof meter?.cooling_electricity_kwh === "number") {
      bucket.coolingKwh = (bucket.coolingKwh ?? 0) + meter.cooling_electricity_kwh;
    }
    if (typeof meter?.hvac_electricity_kwh === "number") {
      bucket.hvacKwh = (bucket.hvacKwh ?? 0) + meter.hvac_electricity_kwh;
    }
    buckets.set(key, bucket);
  }
  return [...buckets.values()].sort((left, right) => left.timestamp - right.timestamp);
}


export function timestampLabel(timestep: SimulationTimestep, index: number) {
  const value = timestep.simulation_timestamp;
  if (!value) return `Step ${timestep.timestep_number ?? index + 1}`;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString(undefined, {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export function zoneNames(timesteps: SimulationTimestep[]) {
  const names = new Set<string>();
  timesteps.forEach((timestep) =>
    Object.keys(timestep.results?.zone_results ?? {}).forEach((name) =>
      names.add(name),
    ),
  );
  return [...names].sort((left, right) => left.localeCompare(right));
}

export function zoneAt(
  timestep: SimulationTimestep | undefined,
  zoneName: string,
): ZoneResult | undefined {
  return timestep?.results?.zone_results?.[zoneName];
}

/** Average the recorded window actuator factors for one zone and timestep. */
export function zoneWindowOpeningPercent(
  timestep: SimulationTimestep | undefined,
  zoneName: string,
): number | null {
  const zones = timestep?.results?.window_opening_results ?? {};
  const zone = Object.entries(zones).find(
    ([key, value]) => (value.zone_name || key) === zoneName,
  )?.[1];
  if (!zone) return null;

  const factors = (zone.window_results ?? [])
    .map((window) => window.opening_factor)
    .filter((factor): factor is number =>
      typeof factor === "number" && Number.isFinite(factor) && factor >= 0 && factor <= 1,
    );
  if (factors.length) {
    return (factors.reduce((sum, factor) => sum + factor, 0) / factors.length) * 100;
  }
  return typeof zone.mean_opening_percent === "number" && Number.isFinite(zone.mean_opening_percent)
    ? zone.mean_opening_percent
    : null;
}
