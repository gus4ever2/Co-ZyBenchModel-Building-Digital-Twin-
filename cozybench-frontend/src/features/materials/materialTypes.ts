export const materialTypes = [
  ["MATERIAL", "MaterialTypeEnum", "Materials"],
  ["MATERIAL_NO_MASS", "MaterialTypeEnum", "No Mass Materials"],
  ["MATERIAL_AIR_GAP", "MaterialTypeEnum", "Air Gap Materials"],
  [
    "MATERIAL_INFRARED_TRANSPARENT",
    "MaterialTypeEnum",
    "Infrared Transparent Materials",
  ],
  ["MATERIAL_ROOF_VEGETATION", "MaterialTypeEnum", "Roof Vegetation Materials"],
  [
    "WINDOW_MATERIAL_SIMPLE_GLAZING_SYSTEM",
    "WindowMaterialTypeEnum",
    "Simple Glazing Systems",
  ],
  ["WINDOW_MATERIAL_GLAZING", "WindowMaterialTypeEnum", "Glazing Materials"],
  ["WINDOW_MATERIAL_GAS", "WindowMaterialTypeEnum", "Gas Materials"],
  [
    "WINDOW_MATERIAL_GAS_MIXTURE",
    "WindowMaterialTypeEnum",
    "Gas Mixture Materials",
  ],
  ["WINDOW_MATERIAL_BLIND", "WindowMaterialTypeEnum", "Blind Materials"],
  ["WINDOW_MATERIAL_SCREEN", "WindowMaterialTypeEnum", "Screen Materials"],
  ["WINDOW_MATERIAL_SHADE", "WindowMaterialTypeEnum", "Shade Materials"],
  [
    "WINDOW_MATERIAL_GLAZING_REFRACTION_EXTINCTION_METHOD",
    "WindowMaterialTypeEnum",
    "Refraction Extinction Glazing",
  ],
] as const;

export type MaterialType = (typeof materialTypes)[number][0];

export function materialType(type: string) {
  return materialTypes.find((item) => item[0] === type);
}

export const selectOptions: Record<string, readonly string[]> = {
  Roughness: [
    "VeryRough",
    "Rough",
    "MediumRough",
    "MediumSmooth",
    "Smooth",
    "VerySmooth",
  ],
  Optical_Data_Type: [
    "SpectralAverage",
    "Spectral",
    "BSDF",
    "SpectralAndAngle",
  ],
  Gas_Type: ["Air", "Argon", "Krypton", "Xenon", "Custom"],
  Gas_1_Type: ["Air", "Argon", "Krypton", "Xenon"],
  Gas_2_Type: ["Air", "Argon", "Krypton", "Xenon"],
  Gas_3_Type: ["Air", "Argon", "Krypton", "Xenon"],
  Gas_4_Type: ["Air", "Argon", "Krypton", "Xenon"],
  Solar_Diffusing: ["No", "Yes"],
  Slat_Orientation: ["Horizontal", "Vertical"],
  Reflected_Beam_Transmittance_Accounting_Method: [
    "DoNotModel",
    "ModelAsDirectBeam",
    "ModelAsDiffuse",
  ],
  Moisture_Diffusion_Calculation_Method: ["Simple", "Advanced"],
  Angle_of_Resolution_for_Screen_Transmittance_Output_Map: [
    "0",
    "1",
    "2",
    "3",
    "5",
  ],
};

export const formatFieldName = (name: string) => name.replaceAll("_", " ");
