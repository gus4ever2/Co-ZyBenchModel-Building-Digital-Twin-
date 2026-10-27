export type ConstructionField = {
  label: string;
  type: "alpha" | "real" | "integer" | "choice" | "construction";
  required: boolean;
  unit?: string;
  min?: number;
  max?: number;
  exclusiveMin?: boolean;
  keys?: string[];
};
export const constructionIddMetadata: Record<
  string,
  Record<string, ConstructionField>
> = {
  CONSTRUCTION_AIR_BOUNDARY: {
    Name: { label: "Name", type: "alpha", required: true },
    Air_Exchange_Method: {
      label: "Air Exchange Method",
      type: "choice",
      required: false,
      keys: ["None", "SimpleMixing"],
    },
    Simple_Mixing_Air_Changes_per_Hour: {
      label: "Simple Mixing Air Changes per Hour",
      type: "real",
      required: false,
      unit: "1/hr",
      min: 0,
    },
    Simple_Mixing_Schedule_Name: {
      label: "Simple Mixing Schedule Name",
      type: "alpha",
      required: false,
    },
  },
  CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE: {
    Name: { label: "Name", type: "alpha", required: true },
    Construction_Name: {
      label: "Construction",
      type: "construction",
      required: true,
    },
    Thermal_Source_Present_After_Layer_Number: {
      label: "Thermal Source Present After Layer Number",
      type: "integer",
      required: true,
      min: 1,
    },
    Temperature_Calculation_Requested_After_Layer_Number: {
      label: "Temperature Calculation Requested After Layer Number",
      type: "integer",
      required: true,
    },
    Dimensions_for_the_CTF_Calculation: {
      label: "Dimensions for the CTF Calculation",
      type: "integer",
      required: true,
      min: 1,
      max: 2,
    },
    Tube_Spacing: {
      label: "Tube Spacing",
      type: "real",
      required: true,
      unit: "m",
      min: 0.01,
      max: 1,
    },
    Two_Dimensional_Temperature_Calculation_Position: {
      label: "Two-Dimensional Temperature Calculation Position",
      type: "real",
      required: false,
      min: 0,
      max: 1,
    },
  },
  CONSTRUCTION_CFACTOR_UNDERGROUND_WALL: {
    Name: { label: "Name", type: "alpha", required: true },
    C_Factor: {
      label: "C-Factor",
      type: "real",
      required: true,
      unit: "W/m2-K",
      min: 0,
      exclusiveMin: true,
    },
    Height: {
      label: "Height",
      type: "real",
      required: true,
      unit: "m",
      min: 0,
      exclusiveMin: true,
    },
  },
  CONSTRUCTION_FFACTOR_GROUND_FLOOR: {
    Name: { label: "Name", type: "alpha", required: true },
    F_Factor: {
      label: "F-Factor",
      type: "real",
      required: true,
      unit: "W/m-K",
      min: 0,
      exclusiveMin: true,
    },
    Area: {
      label: "Area",
      type: "real",
      required: true,
      unit: "m2",
      min: 0,
      exclusiveMin: true,
    },
    PerimeterExposed: {
      label: "Perimeter Exposed",
      type: "real",
      required: true,
      unit: "m",
      min: 0,
    },
  },
};
