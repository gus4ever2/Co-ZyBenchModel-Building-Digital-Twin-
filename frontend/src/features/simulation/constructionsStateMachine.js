import SpaceTypeAssignmentPage from "./SpaceTypeAssignmentPage.jsx"
import {ChoiceData} from "./SimulationCard.jsx"


const buildings = [
  { label: "Small Office", value: "small_office", description:"• size: 510.97 m² • floors: 1 • zones: 6"  },
  { label: "Medium Office", value: "medium_office", description: "• size: 4983.22 m² • floors: 3 • zones: 18"  },
  { label: "Large Office", value: "large_office", description: "• size: 46314.19 m² • floors: 12 • zones: 72" },
  { label: "Primary School", value: "primary_school", description: "• size: 6871.80 m² • floors: 1 • zones: 25" },
  { label: "Secondary School", value: "secondary_school", description: "• size: 19585.89 m² • floors: 2 • zones: 46" },
];

const constructionSets = [
  {
    value: "189_1_2009_CZ1_Office",
    label: "189.1-2009 - CZ1 - Office",
    description: "Office construction set for Climate Zone 1",
    icon: "construction",
  },
  {
    value: "189_1_2009_CZ2_Office",
    label: "189.1-2009 - CZ2 - Office",
    description: "Office construction set for Climate Zone 2",
    icon: "construction",
  },
  {
    value: "189_1_2009_CZ3_Office",
    label: "189.1-2009 - CZ3 - Office",
    description: "Office construction set for Climate Zone 3",
    icon: "construction",
  },
  {
    value: "189_1_2009_CZ4_Office",
    label: "189.1-2009 - CZ4 - Office",
    description: "Office construction set for Climate Zone 4",
    icon: "construction",
  },
  {
    value: "189_1_2009_CZ5_Office",
    label: "189.1-2009 - CZ5 - Office",
    description: "Office construction set for Climate Zone 5",
    icon: "construction",
  },
  {
    value: "189_1_2009_CZ6_Office",
    label: "189.1-2009 - CZ6 - Office",
    description: "Office construction set for Climate Zone 6",
    icon: "construction",
  },
  {
    value: "189_1_2009_CZ7_8_Office",
    label: "189.1-2009 - CZ7-8 - Office",
    description: "Office construction set for Climate Zones 7 and 8",
    icon: "construction",
  },
];

const environments = [
  {
    value: "mumbai",
    label: "Mumbai",
    description: "Extreme Hot Humid",
    city: "Mumbai",
    cz: "Extreme Hot Humid",
    wall: "3.4 cm",
    window: "2.1 W/mK",
    roof: "17 cm",
    icon: "environment",
  },
  {
    value: "cairo",
    label: "Cairo",
    description: "Hot Dry",
    city: "Cairo",
    cz: "Hot Dry",
    wall: "4.5 cm",
    window: "0.042 W/mK",
    roof: "21 cm",
    icon: "environment",
  },
  {
    value: "los_angeles",
    label: "Los Angeles",
    description: "Warm Dry",
    city: "Los Angeles",
    cz: "Warm Dry",
    wall: "5.6 cm",
    window: "0.019 W/mK",
    roof: "21 cm",
    icon: "environment",
  },
  {
    value: "paris",
    label: "Paris",
    description: "Mixed Humid",
    city: "Paris",
    cz: "Mixed Humid",
    wall: "6.8 cm",
    window: "0.013 W/mK",
    roof: "21 cm",
    icon: "environment",
  },
  {
    value: "scranton",
    label: "Scranton",
    description: "Cool Humid",
    city: "Scranton",
    cz: "Cool Humid",
    wall: "7.9 cm",
    window: "0.013 W/mK",
    roof: "21 cm",
    icon: "environment",
  },
];

const systems = [
  {
    value: "CAV",
    label: "Constant Air Volume (CAV)",
    description: "Traditional system with fixed airflow rates",
    icon: "system",
  },
  {
    value: "VAV",
    label: "Variable Air Volume (VAV)",
    description: "Adjustable airflow for better energy efficiency",
    icon: "system",
  },
  {
    value: "VRF",
    label: "Variable Refrigerant Flow (VRF)",
    description: "Advanced system with precise zone control",
    icon: "system",
  },
];

const spaces = {
  "Space OfficeL": "",
  "Space OfficeS": "",
  "Space Conference": "",
  "Space Kitchen": "",
  "Space OfficeM": "",
  "Space BreakRoom": "",
  "Space no hvac 1": "",
  "Space no hvac 2": "",
  "Space no hvac 3": "",
};

const constructionsStateMachine = {
  selectBuilding: {
    stateName: "selectBuilding",
    progressStep: "BUILDING",
    title: "Select building",
    subtitle: "Choose the reference building model that will be used for the digital twin.",
    badge: "Building model",
    type: "building",
    options: buildings,
    selectedKey: "building",
    previousState: "selectBuilding",
    nextState: "selectConstructionSet",
    component: "ChoiceData",
  },

  selectConstructionSet: {
    stateName: "selectConstructionSet",
    progressStep: "CONSTRUCTION SET",
    url: "http://localhost:8080/constructions/loadConstructionSetsData",
    title: "Select construction set",
    subtitle:
      "Pick one construction set. It defines the default wall, roof, floor, window, and door constructions for the building model.",
    badge: "Building envelope",
    type: "construction",
    //options: constructionSets,
    options: null,
    selectedKey: "constructionSet",
    previousState: "selectBuilding",
    nextState: "assignSpaces",
    component: "ChoiceData",
  },

  assignSpaces: {
    stateName: "assignSpaces",
    progressStep: "SPACES",
    title: "Assign spaces",
    subtitle:
      "Assign space types to the spaces of the selected building model.",
    badge: "Space assignment",
    type: "spaces",
    options: spaces,
    selectedKey: "spaces",
    previousState: "selectConstructionSet",
    nextState: "selectEnvironment",
    component: "SpaceTypeAssignmentPage",
  },

  selectEnvironment: {
    stateName: "selectEnvironment",
    progressStep: "CITY",
    title: "Select City",
    subtitle: "Choose the weather and climate configuration for the simulation.",
    badge: "Environment",
    type: "environment",
    options: environments,
    selectedKey: "environment",
    previousState: "assignSpaces",
    nextState: "selectSystem",
    component: "ChoiceData",
  },

  selectSystem: {
    stateName: "selectSystem",
    progressStep: "HVAC",
    title: "Select HVAC system",
    subtitle: "Choose the system that will serve the building thermal zones.",
    badge: "HVAC system",
    type: "system",
    options: systems,
    selectedKey: "hvacSystem",
    previousState: "selectEnvironment",
    nextState: null,
    component: "ChoiceData",
  },
};

export default function createCurrentState(stateName = "selectBuilding") {
  return constructionsStateMachine[stateName];
}

export { constructionsStateMachine };