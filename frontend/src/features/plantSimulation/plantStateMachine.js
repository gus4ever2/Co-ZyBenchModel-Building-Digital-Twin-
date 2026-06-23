import { Component } from "lucide-react";
import yplantQmcFormSchema from "./yplantQmcFormSchema.js"

const plantStateMachine = {
  initialState: "selectTab",

  selectTab:{
    stateName: "selectTab",
    category: "Create Plant Digital Twin",
    options: [
      {title:"Plant Simulation", nextState:"uploadPlant", icon:"Sprout", description: "Define plant behavior, conditions, and simulation flow."},
    ],
    dataType: "button",
    previousState:"selectTab",
  },

  uploadPlant:{
    stateName: "uploadPlant",
    category: "Create Plant",
    metaData: {
      PLANT_YPLANT_QMC_CO2_SIMULATION:{
        enumValue: "PLANT_YPLANT_QMC_CO2_SIMULATION",
        enumClass: "PlantEnum",
        displayName: "Plant Simulation",
      },
    },
    formData: yplantQmcFormSchema,
    options: undefined,
    url: null,
    parameterName: "id",
    parameterValue: "0",
    dataType: "UploadFiles",
    componentDisplayer:"form",
    previousState:"selectTab",
    nextState: "uploadPlant",
  },

  managePlant:{
    stateName: "managePlant",
    category: "PlantSimulation",
    metaData: {
      PLANT_YPLANT_QMC_CO2_SIMULATION:{
        enumValue: "PLANT_YPLANT_QMC_CO2_SIMULATION",
        enumClass: "PlantEnum",
        displayName: "Plant Simulation",
      },
    },
    formData: yplantQmcFormSchema,
    options: null,
    url: "http://localhost:8080/constructions/loadPlantsData",
    parameterName: "id",
    parameterValue: "0",
    dataType: "ManageComponet",
    componentDisplayer:"form",
    previousState:"selectTab",
    nextState: "managePlant",
  },

};

export default function createCurrentStatePlant(stateName) {

  let stateTemplate;
  if (stateName === "initialState") {
    stateTemplate = plantStateMachine[plantStateMachine.initialState];
  }
  else{
    stateTemplate = plantStateMachine[stateName];
  }

  return {...stateTemplate};
}
