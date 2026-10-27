import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const source = process.argv[2];
if (!source)
  throw new Error(
    "Usage: node scripts/generate-material-idd.mjs <Energy+.idd>",
  );

const objectMap = {
  Material: "MATERIAL",
  "Material:NoMass": "MATERIAL_NO_MASS",
  "Material:AirGap": "MATERIAL_AIR_GAP",
  "Material:InfraredTransparent": "MATERIAL_INFRARED_TRANSPARENT",
  "Material:RoofVegetation": "MATERIAL_ROOF_VEGETATION",
  "WindowMaterial:SimpleGlazingSystem": "WINDOW_MATERIAL_SIMPLE_GLAZING_SYSTEM",
  "WindowMaterial:Glazing": "WINDOW_MATERIAL_GLAZING",
  "WindowMaterial:Gas": "WINDOW_MATERIAL_GAS",
  "WindowMaterial:GasMixture": "WINDOW_MATERIAL_GAS_MIXTURE",
  "WindowMaterial:Blind": "WINDOW_MATERIAL_BLIND",
  "WindowMaterial:Screen": "WINDOW_MATERIAL_SCREEN",
  "WindowMaterial:Shade": "WINDOW_MATERIAL_SHADE",
  "WindowMaterial:Glazing:RefractionExtinctionMethod":
    "WINDOW_MATERIAL_GLAZING_REFRACTION_EXTINCTION_METHOD",
};

const normalize = (name) =>
  name
    .replace(/[’']/g, "")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
const lines = readFileSync(resolve(source), "utf8").split(/\r?\n/);
const result = {};
let currentObject = null;
let currentField = null;

for (const line of lines) {
  const objectMatch = line.match(/^([^\\\s][^,;]*),\s*$/);
  if (objectMatch) {
    currentObject = objectMap[objectMatch[1]] ?? null;
    currentField = null;
    if (currentObject) result[currentObject] = {};
    continue;
  }
  if (!currentObject) continue;

  const fieldMatch = line.match(/^\s*[AN]\d+\s*[,;]\s*\\field\s+(.+?)\s*$/);
  if (fieldMatch) {
    currentField = normalize(fieldMatch[1]);
    result[currentObject][currentField] = {
      label: fieldMatch[1],
      required: false,
      type: "alpha",
      keys: [],
    };
    continue;
  }
  if (!currentField) continue;

  const field = result[currentObject][currentField];
  const annotation = line.trim();
  if (annotation === "\\required-field") field.required = true;
  else if (annotation.startsWith("\\type "))
    field.type = annotation.slice(6).trim();
  else if (annotation.startsWith("\\units "))
    field.unit = annotation.slice(7).trim();
  else if (annotation.startsWith("\\key "))
    field.keys.push(annotation.slice(5).trim());
  else if (annotation.startsWith("\\default "))
    field.defaultValue = annotation.slice(9).trim();
  else if (annotation.startsWith("\\minimum> ")) {
    field.min = Number(annotation.slice(10));
    field.exclusiveMin = true;
  } else if (annotation.startsWith("\\minimum ")) {
    field.min = Number(annotation.slice(9));
    field.exclusiveMin = false;
  } else if (annotation.startsWith("\\maximum< ")) {
    field.max = Number(annotation.slice(10));
    field.exclusiveMax = true;
  } else if (annotation.startsWith("\\maximum ")) {
    field.max = Number(annotation.slice(9));
    field.exclusiveMax = false;
  }
}

const output =
  `// Generated from EnergyPlus 24.2 Energy+.idd. Do not edit manually.\n` +
  `export const materialIddMetadata = ${JSON.stringify(result, null, 2)} as const\n`;

writeFileSync(
  resolve("src/features/materials/materialIddMetadata.generated.ts"),
  output,
);
console.log(
  `Generated metadata for ${Object.keys(result).length} CozyBench material types.`,
);
