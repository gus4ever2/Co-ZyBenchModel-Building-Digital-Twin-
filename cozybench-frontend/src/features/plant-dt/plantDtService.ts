import api from "../../lib/api";

export type PlantCreationEvent = {
  id: string;
  name: string;
  city?: string;
  status: string;
  progress: number;
  error?: string;
  modelReady: boolean;
  profileGridPointCount: number;
  reflectance: number;
  transmittance: number;
  vcmax: number;
  jmax: number;
  rd: number;
  totalLeafAreaM2?: number | null;
};

export type PlantListResponse = {
  count: number;
  plants: PlantCreationEvent[];
};

export async function loadPlants() {
  const { data } = await api.get<PlantListResponse>("/v1/plants");
  return data.plants ?? [];
}

export async function cancelPlantGeneration(plantId: string) {
  await api.post(`/v1/plants/${plantId}/cancel`);
}

export async function deletePlant(plantId: string) {
  await api.delete(`/v1/plants/${plantId}`);
}

export async function createPlantDigitalTwin(
  plantName: string,
  reflectance: number,
  transmittance: number,
  vcmax: number,
  jmax: number,
  rd: number,
  objFile: File,
) {
  const body = new FormData();
  body.append("plantName", plantName);
  body.append("reflectance", String(reflectance));
  body.append("transmittance", String(transmittance));
  body.append("vcmax", String(vcmax));
  body.append("jmax", String(jmax));
  body.append("rd", String(rd));
  body.append("objFile", objFile);
  const { data } = await api.post<{ plantId: string }>("/v1/plants", body, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.plantId;
}

export async function loadPlant(plantId: string) {
  const { data } = await api.get<PlantCreationEvent>(`/v1/plants/${plantId}`);
  return data;
}

export async function downloadPlantJson(plantId: string) {
  const { data } = await api.get<Blob>(`/v1/plants/${plantId}/export`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = `plant-${plantId}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function loadPlantModelFiles(plantId: string) {
  const [obj, mtl] = await Promise.all([
    api.get<string>(`/v1/plants/${plantId}/obj`, { responseType: "text" }),
    api.get<string>(`/v1/plants/${plantId}/mtl`, { responseType: "text" }),
  ]);
  return { obj: obj.data, mtl: mtl.data };
}

export async function loadPlantLibrary() {
  const plants = await loadPlants();
  return plants.filter(
    (plant) => plant.status === "COMPLETED" && plant.modelReady,
  );
}
