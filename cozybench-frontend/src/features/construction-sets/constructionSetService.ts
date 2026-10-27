import { buildingDtApi } from "../../lib/api";
const constructionSetPath = { domain: "CONSTRUCTIONS", category: "CONSTRUCTION_SET", type: "CONSTRUCTION_SET" };

export type Descriptor = { id: string; type: string | null; name: string; displayName?: string; defaultOption?: boolean };
export type ConstructionSetComponent = {
  id: string;
  type: string;
  properties: Record<string, string | null>;
};
export type ConstructionSetState = {
  componentDescriptions: { componentParts: Descriptor[] };
  component: ConstructionSetComponent | null;
  libraryDescriptions: { componentParts: Descriptor[] };
  selectableComponentDescriptions: { componentParts: Descriptor[] };
};

export async function loadConstructionSets(id = "0") {
  const { data } = await buildingDtApi.get<ConstructionSetState>(
    "/loadConstructionSetsData",
    { params: { id } },
  );
  return data;
}
export const createConstructionSet = () =>
  buildingDtApi.post("/create", null, {
    params: constructionSetPath,
  });
export const duplicateConstructionSet = (id: string) =>
  buildingDtApi.post("/duplicate", null, {
    params: { id, ...constructionSetPath },
  });
export const deleteConstructionSet = (id: string) =>
  buildingDtApi.delete("/delete", { params: { id } });
export const addConstructionSet = (id: string) =>
  buildingDtApi.post("/add", null, {
    params: {
      id,
      ...constructionSetPath,
    },
  });
export const updateConstructionSet = (
  component: ConstructionSetComponent,
  properties: Record<string, string>,
) =>
  buildingDtApi.put(
    "/update",
    { id: component.id, ...constructionSetPath, properties },
  );
