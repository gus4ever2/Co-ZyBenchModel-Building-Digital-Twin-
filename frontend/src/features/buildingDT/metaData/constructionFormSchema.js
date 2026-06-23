const constructionFormSchema = {
  CONSTRUCTION_MATERIAL: {
    Name: {
      type: "text",
      display: "Name",
      required: true,
      description: "Construction name is required.",
    },

    Outside_Layer: {
      type: "select",
      display: "Outside Layer",
      required: true,
      options: null,
      accepts: [
        "MATERIAL",
        "MATERIAL_NO_MASS",
        "MATERIAL_AIR_GAP",
        "MATERIAL_INFRARED_TRANSPARENT",
        "MATERIAL_ROOF_VEGETATION",
      ],
      description: "Select a material layer.",
    },

    Layer_2: {
      type: "select",
      display: "Layer 2",
      required: false,
      options: null,
      accepts: [
        "MATERIAL",
        "MATERIAL_NO_MASS",
        "MATERIAL_AIR_GAP",
        "MATERIAL_INFRARED_TRANSPARENT",
        "MATERIAL_ROOF_VEGETATION",
      ],
      description: "Optional material layer.",
    },

    Layer_3: {
      type: "select",
      display: "Layer 3",
      required: false,
      options: null,
      accepts: [
        "MATERIAL",
        "MATERIAL_NO_MASS",
        "MATERIAL_AIR_GAP",
        "MATERIAL_INFRARED_TRANSPARENT",
        "MATERIAL_ROOF_VEGETATION",
      ],
      description: "Optional material layer.",
    },

    Layer_4: {
      type: "select",
      display: "Layer 4",
      required: false,
      options: null,
      accepts: [
        "MATERIAL",
        "MATERIAL_NO_MASS",
        "MATERIAL_AIR_GAP",
        "MATERIAL_INFRARED_TRANSPARENT",
        "MATERIAL_ROOF_VEGETATION",
      ],
      description: "Optional material layer.",
    },

    Layer_5: {
      type: "select",
      display: "Layer 5",
      required: false,
      options: null,
      accepts: [
        "MATERIAL",
        "MATERIAL_NO_MASS",
        "MATERIAL_AIR_GAP",
        "MATERIAL_INFRARED_TRANSPARENT",
        "MATERIAL_ROOF_VEGETATION",
      ],
      description: "Optional material layer.",
    },

    Layer_6: {
      type: "select",
      display: "Layer 6",
      required: false,
      options: null,
      accepts: [
        "MATERIAL",
        "MATERIAL_NO_MASS",
        "MATERIAL_AIR_GAP",
        "MATERIAL_INFRARED_TRANSPARENT",
        "MATERIAL_ROOF_VEGETATION",
      ],
      description: "Optional material layer.",
    },

    Layer_7: {
      type: "select",
      display: "Layer 7",
      required: false,
      options: null,
      accepts: [
        "MATERIAL",
        "MATERIAL_NO_MASS",
        "MATERIAL_AIR_GAP",
        "MATERIAL_INFRARED_TRANSPARENT",
        "MATERIAL_ROOF_VEGETATION",
      ],
      description: "Optional material layer.",
    },

    Layer_8: {
      type: "select",
      display: "Layer 8",
      required: false,
      options: null,
      accepts: [
        "MATERIAL",
        "MATERIAL_NO_MASS",
        "MATERIAL_AIR_GAP",
        "MATERIAL_INFRARED_TRANSPARENT",
        "MATERIAL_ROOF_VEGETATION",
      ],
      description: "Optional material layer.",
    },

    Layer_9: {
      type: "select",
      display: "Layer 9",
      required: false,
      options: null,
      accepts: [
        "MATERIAL",
        "MATERIAL_NO_MASS",
        "MATERIAL_AIR_GAP",
        "MATERIAL_INFRARED_TRANSPARENT",
        "MATERIAL_ROOF_VEGETATION",
      ],
      description: "Optional material layer.",
    },

    Layer_10: {
      type: "select",
      display: "Layer 10",
      required: false,
      options: null,
      accepts: [
        "MATERIAL",
        "MATERIAL_NO_MASS",
        "MATERIAL_AIR_GAP",
        "MATERIAL_INFRARED_TRANSPARENT",
        "MATERIAL_ROOF_VEGETATION",
      ],
      description: "Optional material layer.",
    },
  },

  CONSTRUCTION_WINDOW_MATERIAL: {
    Name: {
      type: "text",
      display: "Name",
      required: true,
      description: "Construction name is required.",
    },

    Outside_Layer: {
      type: "select",
      display: "Outside Layer",
      required: true,
      options: null,
      accepts: [
        "WINDOW_MATERIAL_SIMPLE_GLAZING_SYSTEM",
        "WINDOW_MATERIAL_GLAZING",
        "WINDOW_MATERIAL_GAS",
        "WINDOW_MATERIAL_GAS_MIXTURE",
        "WINDOW_MATERIAL_BLIND",
        "WINDOW_MATERIAL_SCREEN",
        "WINDOW_MATERIAL_SHADE",
        "WINDOW_MATERIAL_GLAZING_REFRACTION_EXTINCTION_METHOD",
      ],
      description: "Select a window material layer.",
    },

    Layer_2: {
      type: "select",
      display: "Layer 2",
      required: false,
      options: null,
      accepts: [
        "WINDOW_MATERIAL_SIMPLE_GLAZING_SYSTEM",
        "WINDOW_MATERIAL_GLAZING",
        "WINDOW_MATERIAL_GAS",
        "WINDOW_MATERIAL_GAS_MIXTURE",
        "WINDOW_MATERIAL_BLIND",
        "WINDOW_MATERIAL_SCREEN",
        "WINDOW_MATERIAL_SHADE",
        "WINDOW_MATERIAL_GLAZING_REFRACTION_EXTINCTION_METHOD",
      ],
      description: "Optional window material layer.",
    },

    Layer_3: {
      type: "select",
      display: "Layer 3",
      required: false,
      options: null,
      accepts: [
        "WINDOW_MATERIAL_SIMPLE_GLAZING_SYSTEM",
        "WINDOW_MATERIAL_GLAZING",
        "WINDOW_MATERIAL_GAS",
        "WINDOW_MATERIAL_GAS_MIXTURE",
        "WINDOW_MATERIAL_BLIND",
        "WINDOW_MATERIAL_SCREEN",
        "WINDOW_MATERIAL_SHADE",
        "WINDOW_MATERIAL_GLAZING_REFRACTION_EXTINCTION_METHOD",
      ],
      description: "Optional window material layer.",
    },

    Layer_4: {
      type: "select",
      display: "Layer 4",
      required: false,
      options: null,
      accepts: [
        "WINDOW_MATERIAL_SIMPLE_GLAZING_SYSTEM",
        "WINDOW_MATERIAL_GLAZING",
        "WINDOW_MATERIAL_GAS",
        "WINDOW_MATERIAL_GAS_MIXTURE",
        "WINDOW_MATERIAL_BLIND",
        "WINDOW_MATERIAL_SCREEN",
        "WINDOW_MATERIAL_SHADE",
        "WINDOW_MATERIAL_GLAZING_REFRACTION_EXTINCTION_METHOD",
      ],
      description: "Optional window material layer.",
    },

    Layer_5: {
      type: "select",
      display: "Layer 5",
      required: false,
      options: null,
      accepts: [
        "WINDOW_MATERIAL_SIMPLE_GLAZING_SYSTEM",
        "WINDOW_MATERIAL_GLAZING",
        "WINDOW_MATERIAL_GAS",
        "WINDOW_MATERIAL_GAS_MIXTURE",
        "WINDOW_MATERIAL_BLIND",
        "WINDOW_MATERIAL_SCREEN",
        "WINDOW_MATERIAL_SHADE",
        "WINDOW_MATERIAL_GLAZING_REFRACTION_EXTINCTION_METHOD",
      ],
      description: "Optional window material layer.",
    },

    Layer_6: {
      type: "select",
      display: "Layer 6",
      required: false,
      options: null,
      accepts: [
        "WINDOW_MATERIAL_SIMPLE_GLAZING_SYSTEM",
        "WINDOW_MATERIAL_GLAZING",
        "WINDOW_MATERIAL_GAS",
        "WINDOW_MATERIAL_GAS_MIXTURE",
        "WINDOW_MATERIAL_BLIND",
        "WINDOW_MATERIAL_SCREEN",
        "WINDOW_MATERIAL_SHADE",
        "WINDOW_MATERIAL_GLAZING_REFRACTION_EXTINCTION_METHOD",
      ],
      description: "Optional window material layer.",
    },

    Layer_7: {
      type: "select",
      display: "Layer 7",
      required: false,
      options: null,
      accepts: [
        "WINDOW_MATERIAL_SIMPLE_GLAZING_SYSTEM",
        "WINDOW_MATERIAL_GLAZING",
        "WINDOW_MATERIAL_GAS",
        "WINDOW_MATERIAL_GAS_MIXTURE",
        "WINDOW_MATERIAL_BLIND",
        "WINDOW_MATERIAL_SCREEN",
        "WINDOW_MATERIAL_SHADE",
        "WINDOW_MATERIAL_GLAZING_REFRACTION_EXTINCTION_METHOD",
      ],
      description: "Optional window material layer.",
    },

    Layer_8: {
      type: "select",
      display: "Layer 8",
      required: false,
      options: null,
      accepts: [
        "WINDOW_MATERIAL_SIMPLE_GLAZING_SYSTEM",
        "WINDOW_MATERIAL_GLAZING",
        "WINDOW_MATERIAL_GAS",
        "WINDOW_MATERIAL_GAS_MIXTURE",
        "WINDOW_MATERIAL_BLIND",
        "WINDOW_MATERIAL_SCREEN",
        "WINDOW_MATERIAL_SHADE",
        "WINDOW_MATERIAL_GLAZING_REFRACTION_EXTINCTION_METHOD",
      ],
      description: "Optional window material layer.",
    },
  },

  CONSTRUCTION_AIR_BOUNDARY: {
    Name: {
      type: "text",
      display: "Name",
      required: true,
      description: "Construction air boundary name is required.",
    },

    Air_Exchange_Method: {
      type: "select",
      display: "Air Exchange Method",
      required: true,
      options: ["None", "SimpleMixing"],
      description: "Allowed values: None, SimpleMixing.",
    },

    Simple_Mixing_Air_Changes_per_Hour: {
      type: "number",
      display: "Simple Mixing Air Changes per Hour",
      unit: "1/hr",
      required: false,
      min: 0,
      step: 0.1,
      defaultValue: 0,
      description: "Simple mixing air changes per hour must be greater than or equal to 0.",
    },
  },

  CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE_MATERIAL: {
    Name: {
      type: "text",
      display: "Name",
      required: true,
      description: "Internal heat source property name is required.",
    },

    Construction_Name: {
      type: "select",
      display: "Construction Name",
      required: true,
      accepts: ["CONSTRUCTION_MATERIAL"],
      description: "Select a material construction.",
    },

    Thermal_Source_Present_After_Layer_Number: {
      type: "number",
      display: "Thermal Source Present After Layer Number",
      required: true,
      min: 1,
      step: 1,
      description: "Layer number must be greater than or equal to 1.",
    },

    Temperature_Calculation_Requested_After_Layer_Number: {
      type: "number",
      display: "Temperature Calculation Requested After Layer Number",
      required: true,
      min: 1,
      step: 1,
      description: "Layer number must be greater than or equal to 1.",
    },

    Dimensions_for_the_CTF_Calculation: {
      type: "number",
      display: "Dimensions for the CTF Calculation",
      required: true,
      min: 1,
      max: 2,
      step: 1,
      defaultValue: 1,
      description: "Usually 1 for one-dimensional heat transfer.",
    },

    Tube_Spacing: {
      type: "number",
      display: "Tube Spacing",
      unit: "m",
      required: true,
      min: 0,
      exclusiveMin: true,
      step: 0.001,
      defaultValue: 0.15,
      description: "Tube spacing must be greater than 0 m.",
    },

    Two_Dimensional_Temperature_Calculation_Position: {
      type: "number",
      display: "Two Dimensional Temperature Calculation Position",
      unit: "m",
      required: false,
      min: 0,
      step: 0.001,
      defaultValue: 0.5,
      description: "Position used for two-dimensional temperature calculation.",
    },
  },

  CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE_WINDOW_MATERIAL: {
    Name: {
      type: "text",
      display: "Name",
      required: true,
      description: "Internal heat source property name is required.",
    },

    Construction_Name: {
      type: "select",
      display: "Construction Name",
      required: true,
      accepts: ["CONSTRUCTION_WINDOW_MATERIAL"],
      description: "Select a window material construction.",
    },

    Thermal_Source_Present_After_Layer_Number: {
      type: "number",
      display: "Thermal Source Present After Layer Number",
      required: true,
      min: 1,
      step: 1,
      description: "Layer number must be greater than or equal to 1.",
    },

    Temperature_Calculation_Requested_After_Layer_Number: {
      type: "number",
      display: "Temperature Calculation Requested After Layer Number",
      required: true,
      min: 1,
      step: 1,
      description: "Layer number must be greater than or equal to 1.",
    },

    Dimensions_for_the_CTF_Calculation: {
      type: "number",
      display: "Dimensions for the CTF Calculation",
      required: true,
      min: 1,
      max: 2,
      step: 1,
      defaultValue: 1,
      description: "Usually 1 for one-dimensional heat transfer.",
    },

    Tube_Spacing: {
      type: "number",
      display: "Tube Spacing",
      unit: "m",
      required: true,
      min: 0,
      exclusiveMin: true,
      step: 0.001,
      defaultValue: 0.15,
      description: "Tube spacing must be greater than 0 m.",
    },

    Two_Dimensional_Temperature_Calculation_Position: {
      type: "number",
      display: "Two Dimensional Temperature Calculation Position",
      unit: "m",
      required: false,
      min: 0,
      step: 0.001,
      defaultValue: 0.5,
      description: "Position used for two-dimensional temperature calculation.",
    },
  },

  CONSTRUCTION_CFACTOR_UNDERGROUND_WALL: {
    Name: {
      type: "text",
      display: "Name",
      required: true,
      description: "C-factor underground wall construction name is required.",
    },

    C_Factor: {
      type: "number",
      display: "C-Factor",
      unit: "W/m2-K",
      required: true,
      min: 0,
      exclusiveMin: true,
      step: 0.01,
      description: "C-Factor must be greater than 0 W/m2-K.",
    },

    Height: {
      type: "number",
      display: "Height",
      unit: "m",
      required: true,
      min: 0,
      exclusiveMin: true,
      step: 0.01,
      description: "Height must be greater than 0 m.",
    },
  },

  CONSTRUCTION_FFACTOR_GROUND_FLOOR: {
    Name: {
      type: "text",
      display: "Name",
      required: true,
      description: "F-factor ground floor construction name is required.",
    },

    F_Factor: {
      type: "number",
      display: "F-Factor",
      unit: "W/m-K",
      required: true,
      min: 0,
      exclusiveMin: true,
      step: 0.01,
      description: "F-Factor must be greater than 0 W/m-K.",
    },

    Area: {
      type: "number",
      display: "Area",
      unit: "m2",
      required: true,
      min: 0,
      exclusiveMin: true,
      step: 0.01,
      description: "Area must be greater than 0 m2.",
    },

    Perimeter_Exposed: {
      type: "number",
      display: "Perimeter Exposed",
      unit: "m",
      required: true,
      min: 0,
      step: 0.01,
      description: "Exposed perimeter must be greater than or equal to 0 m.",
    },
  },
};

export default constructionFormSchema;