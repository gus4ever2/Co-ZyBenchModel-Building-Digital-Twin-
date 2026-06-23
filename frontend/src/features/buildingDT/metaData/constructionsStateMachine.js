import { Component } from "lucide-react";
import materialTypesEnum from "./materialTypesEnum.js"
import constructionTypesEnum from "./constructionTypesEnum.js"
import materialFormSchema from "./materialFormSchema.js"
import constructionFormSchema from "./constructionFormSchema.js"
import simulationFormSchema from "./simulationFormSchema.js"

const constructionsStateMachine = {
  initialState: "selectTab",

  selectTab:{
    stateName: "selectTab",
    category: "Create Building Digital Twin",
    options: [
      {title:"Constructions", nextState:"selectConstructionsType", icon:"HardHat", description: "Manage construction sets, assemblies, and material layers.",},
      {title:"Simulation", nextState:"manageSimulation", icon:"Settings", description: "Set run periods and timesteps.",}
    ],
    dataType: "button",
    previousState:"selectTab",
  },

  selectConstructionsType:{
    stateName: "selectConstructionsType",
    category: "Create Building Digital Twin",
    options: [
      {title:"Construction Sets", nextState:"manageConstructionSet", icon: "PanelsTopLeft", description: "Assign constructions to walls, roofs, floors, and windows.",},
      {title:"Constructions", nextState:"manageConstructions", icon: "BrickWall", description: "Build layered assemblies using materials and window materials.",},
      {title:"Materials", nextState:"manageMaterials", icon: "Cuboid", description: "Create and edit material properties used in constructions.",},
    ],
    dataType: "button",
    previousState:"selectTab",
  },

  manageSimulation: {
    stateName: "manageSimulation",
    category:"Simulation",
    metaData: {
      RUN_PERIOD_AND_TIMESTEP: {
        enumValue: "RUN_PERIOD_AND_TIMESTEP",
        enumClass: "SimulationTypeEnum",
        displayName: "Simulation",
      },  
    },
  
    formData: simulationFormSchema,
    options: null,
    url: "http://localhost:8080/constructions/loadSimulationData",
    parameterName: "id",
    parameterValue: "0",
    dataType: "onlyForm",
    componentDisplayer:"form",
    previousState:"selectTab",
    nextState: "manageSimulation",
  },

  manageMaterials: {
    stateName: "manageMaterials",
    category:"Material",
    metaData: materialTypesEnum,
    formData: materialFormSchema,
    options: null,
    url: "http://localhost:8080/constructions/loadMaterialsData",
    parameterName: "id",
    parameterValue: "0",
    dataType: "ManageComponet",
    componentDisplayer:"form",
    previousState:"selectConstructionsType",
    nextState: "manageMaterials",
  },

  manageConstructions: {
    stateName: "manageConstructions",
    category:"Construction",
    metaData: constructionTypesEnum,
    formData: constructionFormSchema,
    options: null,
    url: "http://localhost:8080/constructions/loadConstructionsData",
    parameterName: "id",
    parameterValue: "0",
    dataType: "ManageComponet",
    componentDisplayer:"form",
    previousState:"selectConstructionsType",
    nextState: "manageConstructions",
  },

  manageConstructionSet: {
    stateName: "manageConstructionSet",
    category: "Construction Set",
    metaData: {
      CONSTRUCTION_SET: {
        enumValue: "CONSTRUCTION_SET",
        enumClass: "ConstructionSetTypeEnum",
        displayName: "Construction Set",
      },  
    },
    options: null,
    url: "http://localhost:8080/constructions/loadConstructionSetsData",
    parameterName: "id",
    parameterValue: "0",
    dataType: "ManageComponet",
    componentDisplayer:"slots",
    previousState:"selectConstructionsType",
    nextState: "manageConstructionSet",
  },
};

export default function createCurrentState(stateName) {

  let stateTemplate;
  if (stateName === "initialState"){
    stateTemplate = constructionsStateMachine[constructionsStateMachine.initialState];
  }
  else{
    stateTemplate = constructionsStateMachine[stateName];
  }

  return {...stateTemplate};
}
