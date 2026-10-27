import { buildingDtApi } from "../../lib/api";
import type { ConstructionType } from "./constructionTypes";
const constructionPath = (type: ConstructionType) => ({
  domain: "CONSTRUCTIONS", category: "CONSTRUCTION", type,
});
export type Descriptor = { id: string; type: string | null; name: string };
export type ConstructionComponent = {
  id: string;
  type: ConstructionType;
  properties: Record<string, string | null>;
};
export type ConstructionState = {
  componentDescriptions: { componentParts: Descriptor[] };
  component: ConstructionComponent | null;
  libraryDescriptions: { componentParts: Descriptor[] };
  selectableComponentDescriptions: { componentParts: Descriptor[] };
};
export async function loadConstructions(id = "0") {
  const { data } = await buildingDtApi.get<ConstructionState>(
    "/loadConstructionsData",
    { params: { id } },
  );
  return data;
}
export const createConstruction = (type: ConstructionType) =>
  buildingDtApi.post("/create", null, { params: constructionPath(type) });
export const duplicateConstruction = (id: string, type: ConstructionType) =>
  buildingDtApi.post("/duplicate", null, { params: { id, ...constructionPath(type) } });
export const deleteConstruction = (id: string) =>
  buildingDtApi.delete("/delete", { params: { id } });
export const addConstruction = (item: Descriptor) =>
  buildingDtApi.post("/add", null, {
    params: {
      id: item.id,
      ...constructionPath((item.type ?? "CONSTRUCTION") as ConstructionType),
    },
  });
export const updateConstruction = (
  component: ConstructionComponent,
  properties: Record<string, string>,
) =>
  buildingDtApi.put(
    "/update",
    { id: component.id, ...constructionPath(component.type), properties },
  );
