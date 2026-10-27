export const climateZones = [
  { code: "0A", label: "Extremely Hot Humid", color: "#e600d7" },
  { code: "0B", label: "Extremely Hot Dry", color: "#b72bd1" },
  { code: "1A", label: "Very Hot Humid", color: "#8a00f4" },
  { code: "1B", label: "Very Hot Dry", color: "#8f82d8" },
  { code: "2A", label: "Hot Humid", color: "#ed1717" },
  { code: "2B", label: "Hot Dry", color: "#ff574c" },
  { code: "3A", label: "Warm Humid", color: "#c45c0b" },
  { code: "3B", label: "Warm Dry", color: "#ff9447" },
  { code: "3C", label: "Warm Marine", color: "#f2a000" },
  { code: "4A", label: "Mixed Humid", color: "#e7df00" },
  { code: "4B", label: "Mixed Dry", color: "#e6e984" },
  { code: "4C", label: "Mixed Marine", color: "#f6c756" },
  { code: "5A", label: "Cool Humid", color: "#149d22" },
  { code: "5B", label: "Cool Dry", color: "#98d77c" },
  { code: "5C", label: "Cool Marine", color: "#315d24" },
  { code: "6A", label: "Cold Humid", color: "#126bb2" },
  { code: "6B", label: "Cold Dry", color: "#789bdb" },
  { code: "7", label: "Very Cold", color: "#10178f" },
  { code: "8", label: "Subarctic", color: "#11d9d9" },
] as const;

export type ClimateZoneCode = (typeof climateZones)[number]["code"];

export const climateZonesByCode = Object.fromEntries(
  climateZones.map((zone) => [zone.code, zone]),
) as Record<ClimateZoneCode, (typeof climateZones)[number]>;

export type DashboardLocation = {
  id: string;
  city: string;
  climateZone: ClimateZoneCode;
  coordinates: [number, number];
  simulations: number;
};

export const dashboardMockData = {
  statistics: {
    simulations: 24,
    constructionSets: 7,
    constructions: 18,
    plantModels: 3,
    materials: 42,
    openWindowConfigurations: 4,
  },
  locations: [
    {
      id: "paris",
      city: "Paris",
      climateZone: "4A",
      coordinates: [48.8566, 2.3522],
      simulations: 14,
    },
    {
      id: "andravida",
      city: "Andravida",
      climateZone: "3A",
      coordinates: [37.905, 21.269],
      simulations: 10,
    },
    {
      id: "la",
      city: "Los Angeles",
      climateZone: "3B",
      coordinates: [34.0522, -118.2437],
      simulations: 0,
    },
    {
      id: "mumbai",
      city: "Mumbai",
      climateZone: "0A",
      coordinates: [19.076, 72.8777],
      simulations: 0,
    },
    {
      id: "scranton",
      city: "Scranton",
      climateZone: "5A",
      coordinates: [41.409, -75.6624],
      simulations: 0,
    },
    {
      id: "beijing",
      city: "Beijing",
      climateZone: "4A",
      coordinates: [39.9042, 116.4074],
      simulations: 0,
    },
  ] satisfies DashboardLocation[],
  currentSimulation: {
    id: "simulation-024",
    status: "RUNNING",
    progress: 68,
    city: "Andravida",
    constructionSet: "189_1_2009_CZ3_Office",
  },
  recentSimulations: [
    {
      id: "simulation-023",
      city: "Paris",
      constructionSet: "189_1_2009_CZ2_Office",
      status: "COMPLETED",
      date: "12 Aug 2026 · 09:42",
    },
    {
      id: "simulation-022",
      city: "Andravida",
      constructionSet: "189_1_2009_CZ3_Office",
      status: "COMPLETED",
      date: "11 Aug 2026 · 18:20",
    },
    {
      id: "simulation-021",
      city: "Paris",
      constructionSet: "189_1_2009_CZ4_Office",
      status: "COMPLETED",
      date: "11 Aug 2026 · 12:05",
    },
  ],
};
