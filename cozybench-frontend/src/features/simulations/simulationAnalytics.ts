import type { SimulationTimestep, ZoneResult } from "./simulationsService";


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
