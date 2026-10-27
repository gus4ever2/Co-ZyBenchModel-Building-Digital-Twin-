export const constructionTypes = [
  ["CONSTRUCTION", "Constructions"],
  ["CONSTRUCTION_AIR_BOUNDARY", "Air Boundary Constructions"],
  [
    "CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE",
    "Internal Heat Source Constructions",
  ],
  [
    "CONSTRUCTION_CFACTOR_UNDERGROUND_WALL",
    "C-Factor Underground Wall Constructions",
  ],
  ["CONSTRUCTION_FFACTOR_GROUND_FLOOR", "F-Factor Ground Floor Constructions"],
] as const;
export type ConstructionType = (typeof constructionTypes)[number][0];

export const opaqueMaterialTypes = new Set([
  "MATERIAL",
  "MATERIAL_NO_MASS",
  "MATERIAL_AIR_GAP",
  "MATERIAL_INFRARED_TRANSPARENT",
  "MATERIAL_ROOF_VEGETATION",
]);
export const windowMaterialTypes = new Set([
  "WINDOW_MATERIAL_SIMPLE_GLAZING_SYSTEM",
  "WINDOW_MATERIAL_GLAZING",
  "WINDOW_MATERIAL_GAS",
  "WINDOW_MATERIAL_GAS_MIXTURE",
  "WINDOW_MATERIAL_BLIND",
  "WINDOW_MATERIAL_SCREEN",
  "WINDOW_MATERIAL_SHADE",
  "WINDOW_MATERIAL_GLAZING_REFRACTION_EXTINCTION_METHOD",
]);
export const constructionTypeLabel = (type: string) =>
  constructionTypes.find((item) => item[0] === type)?.[1] ?? "Constructions";
