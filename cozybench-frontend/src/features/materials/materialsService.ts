import { buildingDtApi } from "../../lib/api";
import type { MaterialType } from "./materialTypes";

const materialPath = (type: MaterialType) => ({
  domain: "CONSTRUCTIONS",
  category: "MATERIAL",
  type,
});

export type MaterialDescriptor = {
  id: string;
  type: MaterialType;
  name: string;
};
export type MaterialComponent = {
  id: string;
  type: MaterialType;
  properties: Record<string, string | number | null>;
};
export type MaterialsState = {
  componentDescriptions: { componentParts: MaterialDescriptor[] };
  component: MaterialComponent | null;
  libraryDescriptions: { componentParts: MaterialDescriptor[] };
};

export async function loadMaterials(id = "0") {
  const { data } = await buildingDtApi.get<MaterialsState>(
    "/loadMaterialsData",
    { params: { id } },
  );
  return data;
}
export const createMaterial = (type: MaterialType) =>
  buildingDtApi.post("/create", null, { params: materialPath(type) });
export const duplicateMaterial = (id: string, type: MaterialType) =>
  buildingDtApi.post("/duplicate", null, { params: { id, ...materialPath(type) } });
export const deleteMaterial = (id: string) =>
  buildingDtApi.delete("/delete", { params: { id } });
export const addLibraryMaterial = (item: MaterialDescriptor) => {
  return buildingDtApi.post("/add", null, {
    params: { id: item.id, ...materialPath(item.type) },
  });
};
export const updateMaterial = (
  component: MaterialComponent,
  properties: Record<string, string>,
) =>
  buildingDtApi.put(
    "/update",
    { id: component.id, ...materialPath(component.type), properties },
  );
