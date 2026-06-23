export const materialFormSchema = {
  MATERIAL: {
    Name: {
      type: "text",
      display: "Name",
      required: true,
      description: "Material name is required.",
    },

    Roughness: {
      type: "select",
      display: "Roughness",
      required: true,
      options: [
        "VeryRough",
        "Rough",
        "MediumRough",
        "MediumSmooth",
        "Smooth",
        "VerySmooth",
      ],
      description:
        "Allowed values: VeryRough, Rough, MediumRough, MediumSmooth, Smooth, VerySmooth.",
    },

    Thickness: {
      type: "number",
      display: "Thickness",
      unit: "m",
      required: true,
      min: 0,
      exclusiveMin: true,
      step: 0.001,
      description: "Thickness must be greater than 0 m.",
    },

    Conductivity: {
      type: "number",
      display: "Conductivity",
      unit: "W/m-K",
      required: true,
      min: 0,
      exclusiveMin: true,
      step: 0.01,
      description: "Conductivity must be greater than 0 W/m-K.",
    },

    Density: {
      type: "number",
      display: "Density",
      unit: "kg/m3",
      required: true,
      min: 0,
      exclusiveMin: true,
      step: 1,
      description: "Density must be greater than 0 kg/m3.",
    },

    Specific_Heat: {
      type: "number",
      display: "Specific Heat",
      unit: "J/kg-K",
      required: true,
      min: 0,
      exclusiveMin: true,
      step: 1,
      description: "Specific heat must be greater than 0 J/kg-K.",
    },

    Thermal_Absorptance: {
      type: "number",
      display: "Thermal Absorptance",
      unit: "",
      required: false,
      min: 0,
      max: 1,
      step: 0.1,
      defaultValue: 0.9,
      description: "Thermal absorptance must be between 0 and 1.",
    },

    Solar_Absorptance: {
      type: "number",
      display: "Solar Absorptance",
      unit: "",
      required: false,
      min: 0,
      max: 1,
      step: 0.1,
      defaultValue: 0.7,
      description: "Solar absorptance must be between 0 and 1.",
    },

    Visible_Absorptance: {
      type: "number",
      display: "Visible Absorptance",
      unit: "",
      required: false,
      min: 0,
      max: 1,
      step: 0.1,
      defaultValue: 0.7,
      description: "Visible absorptance must be between 0 and 1.",
    },
  },

  MATERIAL_NO_MASS: {
    Name: {
      type: "text",
      display: "Name",
      required: true,
      description: "Material name is required.",
    },

    Roughness: {
      type: "select",
      display: "Roughness",
      required: true,
      options: [
        "VeryRough",
        "Rough",
        "MediumRough",
        "MediumSmooth",
        "Smooth",
        "VerySmooth",
      ],
      description:
        "Allowed values: VeryRough, Rough, MediumRough, MediumSmooth, Smooth, VerySmooth.",
    },

    Thermal_Resistance: {
      type: "number",
      display: "Thermal Resistance",
      unit: "m2-K/W",
      required: true,
      min: 0,
      exclusiveMin: true,
      step: 0.01,
      description: "Thermal resistance must be greater than 0 m2-K/W.",
    },

    Thermal_Absorptance: {
      type: "number",
      display: "Thermal Absorptance",
      unit: "",
      required: false,
      min: 0,
      max: 1,
      step: 0.1,
      defaultValue: 0.9,
      description: "Thermal absorptance must be between 0 and 1.",
    },

    Solar_Absorptance: {
      type: "number",
      display: "Solar Absorptance",
      unit: "",
      required: false,
      min: 0,
      max: 1,
      step: 0.1,
      defaultValue: 0.7,
      description: "Solar absorptance must be between 0 and 1.",
    },

    Visible_Absorptance: {
      type: "number",
      display: "Visible Absorptance",
      unit: "",
      required: false,
      min: 0,
      max: 1,
      step: 0.1,
      defaultValue: 0.7,
      description: "Visible absorptance must be between 0 and 1.",
    },
  },

  MATERIAL_AIR_GAP: {
    Name: {
      type: "text",
      display: "Name",
      required: true,
      description: "Material name is required.",
    },

    Thermal_Resistance: {
      type: "number",
      display: "Thermal Resistance",
      unit: "m2-K/W",
      required: true,
      min: 0,
      exclusiveMin: true,
      step: 0.01,
      description: "Thermal resistance must be greater than 0 m2-K/W.",
    },
  },

  WINDOW_MATERIAL_SIMPLE_GLAZING_SYSTEM: {
    Name: {
      type: "text",
      display: "Name",
      required: true,
      description: "Window material name is required.",
    },

    UFactor: {
      type: "number",
      display: "U-Factor",
      unit: "W/m2-K",
      required: true,
      min: 0,
      exclusiveMin: true,
      step: 0.1,
      description: "U-Factor must be greater than 0 W/m2-K.",
    },

    Solar_Heat_Gain_Coefficient: {
      type: "number",
      display: "Solar Heat Gain Coefficient",
      unit: "",
      required: true,
      min: 0,
      max: 1,
      step: 0.01,
      description: "Solar heat gain coefficient must be between 0 and 1.",
    },

    Visible_Transmittance: {
      type: "number",
      display: "Visible Transmittance",
      unit: "",
      required: false,
      min: 0,
      max: 1,
      step: 0.01,
      description: "Visible transmittance must be between 0 and 1.",
    },
  },

  WINDOW_MATERIAL_GLAZING: {
    Name: {
      type: "text",
      display: "Name",
      required: true,
      description: "Glazing material name is required.",
    },

    Optical_Data_Type: {
      type: "select",
      display: "Optical Data Type",
      required: true,
      options: ["SpectralAverage", "Spectral"],
      description: "Allowed values: SpectralAverage, Spectral.",
    },

    Window_Glass_Spectral_Data_Set_Name: {
      type: "text",
      display: "Window Glass Spectral Data Set Name",
      required: false,
      description: "Required only when Optical Data Type is Spectral.",
    },

    Thickness: {
      type: "number",
      display: "Thickness",
      unit: "m",
      required: true,
      min: 0,
      exclusiveMin: true,
      step: 0.001,
      description: "Thickness must be greater than 0 m.",
    },

    Solar_Transmittance_at_Normal_Incidence: {
      type: "number",
      display: "Solar Transmittance at Normal Incidence",
      unit: "",
      required: true,
      min: 0,
      max: 1,
      step: 0.01,
      description: "Solar transmittance must be between 0 and 1.",
    },

    Front_Side_Solar_Reflectance_at_Normal_Incidence: {
      type: "number",
      display: "Front Side Solar Reflectance at Normal Incidence",
      unit: "",
      required: true,
      min: 0,
      max: 1,
      step: 0.01,
      description: "Front side solar reflectance must be between 0 and 1.",
    },

    Back_Side_Solar_Reflectance_at_Normal_Incidence: {
      type: "number",
      display: "Back Side Solar Reflectance at Normal Incidence",
      unit: "",
      required: true,
      min: 0,
      max: 1,
      step: 0.01,
      description: "Back side solar reflectance must be between 0 and 1.",
    },

    Visible_Transmittance_at_Normal_Incidence: {
      type: "number",
      display: "Visible Transmittance at Normal Incidence",
      unit: "",
      required: true,
      min: 0,
      max: 1,
      step: 0.01,
      description: "Visible transmittance must be between 0 and 1.",
    },

    Front_Side_Visible_Reflectance_at_Normal_Incidence: {
      type: "number",
      display: "Front Side Visible Reflectance at Normal Incidence",
      unit: "",
      required: true,
      min: 0,
      max: 1,
      step: 0.01,
      description: "Front side visible reflectance must be between 0 and 1.",
    },

    Back_Side_Visible_Reflectance_at_Normal_Incidence: {
      type: "number",
      display: "Back Side Visible Reflectance at Normal Incidence",
      unit: "",
      required: true,
      min: 0,
      max: 1,
      step: 0.01,
      description: "Back side visible reflectance must be between 0 and 1.",
    },

    Infrared_Transmittance_at_Normal_Incidence: {
      type: "number",
      display: "Infrared Transmittance at Normal Incidence",
      unit: "",
      required: true,
      min: 0,
      max: 1,
      step: 0.01,
      description: "Infrared transmittance must be between 0 and 1.",
    },

    Front_Side_Infrared_Hemispherical_Emissivity: {
      type: "number",
      display: "Front Side Infrared Hemispherical Emissivity",
      unit: "",
      required: true,
      min: 0,
      max: 1,
      step: 0.01,
      description: "Front side infrared emissivity must be between 0 and 1.",
    },

    Back_Side_Infrared_Hemispherical_Emissivity: {
      type: "number",
      display: "Back Side Infrared Hemispherical Emissivity",
      unit: "",
      required: true,
      min: 0,
      max: 1,
      step: 0.01,
      description: "Back side infrared emissivity must be between 0 and 1.",
    },

    Conductivity: {
      type: "number",
      display: "Conductivity",
      unit: "W/m-K",
      required: true,
      min: 0,
      exclusiveMin: true,
      step: 0.01,
      description: "Conductivity must be greater than 0 W/m-K.",
    },

    Dirt_Correction_Factor_for_Solar_and_Visible_Transmittance: {
      type: "number",
      display: "Dirt Correction Factor for Solar and Visible Transmittance",
      unit: "",
      required: false,
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 1,
      description: "Dirt correction factor must be between 0 and 1.",
    },

    Solar_Diffusing: {
      type: "select",
      display: "Solar Diffusing",
      required: false,
      options: ["No", "Yes"],
      description: "Allowed values: No, Yes.",
    },
  },

  WINDOW_MATERIAL_GAS: {
    Name: {
      type: "text",
      display: "Name",
      required: true,
      description: "Gas material name is required.",
    },

    Gas_Type: {
      type: "select",
      display: "Gas Type",
      required: true,
      options: ["Air", "Argon", "Krypton", "Xenon"],
      description: "Allowed values: Air, Argon, Krypton, Xenon.",
    },

    Thickness: {
      type: "number",
      display: "Thickness",
      unit: "m",
      required: true,
      min: 0,
      exclusiveMin: true,
      step: 0.001,
      description: "Thickness must be greater than 0 m.",
    },
  },

  WINDOW_MATERIAL_GAS_MIXTURE: {
    Name: {
      type: "text",
      display: "Name",
      required: true,
      description: "Gas mixture material name is required.",
    },

    Thickness: {
      type: "number",
      display: "Thickness",
      unit: "m",
      required: true,
      min: 0,
      exclusiveMin: true,
      step: 0.001,
      description: "Thickness must be greater than 0 m.",
    },

    Number_of_Gases_in_Mixture: {
      type: "number",
      display: "Number of Gases in Mixture",
      unit: "",
      required: true,
      min: 2,
      max: 4,
      step: 1,
      description: "Number of gases in mixture must be between 2 and 4.",
    },

    Gas_1_Type: {
      type: "select",
      display: "Gas 1 Type",
      required: true,
      options: ["Air", "Argon", "Krypton", "Xenon"],
      description: "Allowed values: Air, Argon, Krypton, Xenon.",
    },

    Gas_1_Fraction: {
      type: "number",
      display: "Gas 1 Fraction",
      unit: "",
      required: true,
      min: 0,
      max: 1,
      step: 0.01,
      description: "Gas 1 fraction must be between 0 and 1.",
    },

    Gas_2_Type: {
      type: "select",
      display: "Gas 2 Type",
      required: true,
      options: ["Air", "Argon", "Krypton", "Xenon"],
      description: "Allowed values: Air, Argon, Krypton, Xenon.",
    },

    Gas_2_Fraction: {
      type: "number",
      display: "Gas 2 Fraction",
      unit: "",
      required: true,
      min: 0,
      max: 1,
      step: 0.01,
      description: "Gas 2 fraction must be between 0 and 1.",
    },

    Gas_3_Type: {
      type: "select",
      display: "Gas 3 Type",
      required: false,
      options: ["Air", "Argon", "Krypton", "Xenon"],
      description: "Allowed values: Air, Argon, Krypton, Xenon.",
    },

    Gas_3_Fraction: {
      type: "number",
      display: "Gas 3 Fraction",
      unit: "",
      required: false,
      min: 0,
      max: 1,
      step: 0.01,
      description: "Gas 3 fraction must be between 0 and 1.",
    },

    Gas_4_Type: {
      type: "select",
      display: "Gas 4 Type",
      required: false,
      options: ["Air", "Argon", "Krypton", "Xenon"],
      description: "Allowed values: Air, Argon, Krypton, Xenon.",
    },

    Gas_4_Fraction: {
      type: "number",
      display: "Gas 4 Fraction",
      unit: "",
      required: false,
      min: 0,
      max: 1,
      step: 0.01,
      description: "Gas 4 fraction must be between 0 and 1.",
    },
  },

  WINDOW_MATERIAL_SHADE: {
    Name: {
      type: "text",
      display: "Name",
      required: true,
      description: "Shade material name is required.",
    },

    Solar_Transmittance: {
      type: "number",
      display: "Solar Transmittance",
      unit: "",
      required: true,
      min: 0,
      max: 1,
      step: 0.01,
      description: "Solar transmittance must be between 0 and 1.",
    },

    Solar_Reflectance: {
      type: "number",
      display: "Solar Reflectance",
      unit: "",
      required: true,
      min: 0,
      max: 1,
      step: 0.01,
      description: "Solar reflectance must be between 0 and 1.",
    },

    Visible_Transmittance: {
      type: "number",
      display: "Visible Transmittance",
      unit: "",
      required: true,
      min: 0,
      max: 1,
      step: 0.01,
      description: "Visible transmittance must be between 0 and 1.",
    },

    Visible_Reflectance: {
      type: "number",
      display: "Visible Reflectance",
      unit: "",
      required: true,
      min: 0,
      max: 1,
      step: 0.01,
      description: "Visible reflectance must be between 0 and 1.",
    },

    Infrared_Hemispherical_Emissivity: {
      type: "number",
      display: "Infrared Hemispherical Emissivity",
      unit: "",
      required: true,
      min: 0,
      max: 1,
      step: 0.01,
      description: "Infrared hemispherical emissivity must be between 0 and 1.",
    },

    Thickness: {
      type: "number",
      display: "Thickness",
      unit: "m",
      required: true,
      min: 0,
      exclusiveMin: true,
      step: 0.001,
      description: "Thickness must be greater than 0 m.",
    },

    Conductivity: {
      type: "number",
      display: "Conductivity",
      unit: "W/m-K",
      required: true,
      min: 0,
      exclusiveMin: true,
      step: 0.01,
      description: "Conductivity must be greater than 0 W/m-K.",
    },

    Shade_to_Glass_Distance: {
      type: "number",
      display: "Shade to Glass Distance",
      unit: "m",
      required: false,
      min: 0,
      step: 0.001,
      description: "Shade to glass distance must be at least 0 m.",
    },

    Top_Opening_Multiplier: {
      type: "number",
      display: "Top Opening Multiplier",
      unit: "",
      required: false,
      min: 0,
      max: 1,
      step: 0.01,
      description: "Top opening multiplier must be between 0 and 1.",
    },

    Bottom_Opening_Multiplier: {
      type: "number",
      display: "Bottom Opening Multiplier",
      unit: "",
      required: false,
      min: 0,
      max: 1,
      step: 0.01,
      description: "Bottom opening multiplier must be between 0 and 1.",
    },

    Left_Side_Opening_Multiplier: {
      type: "number",
      display: "Left Side Opening Multiplier",
      unit: "",
      required: false,
      min: 0,
      max: 1,
      step: 0.01,
      description: "Left side opening multiplier must be between 0 and 1.",
    },

    Right_Side_Opening_Multiplier: {
      type: "number",
      display: "Right Side Opening Multiplier",
      unit: "",
      required: false,
      min: 0,
      max: 1,
      step: 0.01,
      description: "Right side opening multiplier must be between 0 and 1.",
    },

    Airflow_Permeability: {
      type: "number",
      display: "Airflow Permeability",
      unit: "",
      required: false,
      min: 0,
      max: 1,
      step: 0.01,
      description: "Airflow permeability must be between 0 and 1.",
    },
  },

  MATERIAL_INFRARED_TRANSPARENT: {
    Name: {
      type: "text",
      display: "Name",
      required: true,
      description: "Infrared transparent material name is required.",
    },
  },
};

export default materialFormSchema;