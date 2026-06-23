const yplantQmcFormSchema = {
  PLANT_YPLANT_QMC_CO2_SIMULATION: {
    Name: {
      type: "text",
      display: "Output JSON File Path",
      required: true,
      defaultValue: "YPlantQMC CO2 Simulation",
      description: "Plant name is required.",
    },
    Start: {
      type: "number",
      display: "Start CO2 ppm",
      required: true,
      defaultValue: 400,
      min: 0,
      step: 1,
      description: "Start CO2 concentration in ppm. This value is inclusive.",
    },

    End: {
      type: "number",
      display: "End CO2 ppm",
      required: true,
      defaultValue: 2500,
      min: 0,
      step: 1,
      description: "End CO2 concentration in ppm. This value is inclusive.",
    },

    Step: {
      type: "number",
      display: "CO2 Step Size",
      required: true,
      defaultValue: 100,
      min: 1,
      step: 1,
      description: "CO2 concentration step size in ppm.",
    },

    Nsteps: {
      type: "number",
      display: "Number of Daylight Steps",
      required: true,
      defaultValue: 24,
      min: 1,
      step: 1,
      description: "Number of simulation steps within daylight.",
    },

    Output: {
      type: "text",
      display: "Output JSON File Path",
      required: true,
      defaultValue: "tartu_aug21_co2_absorption.json",
      description: "Path of the output JSON file that stores hourly CO2 absorption in grams.",
    },
  },
};

export default yplantQmcFormSchema;