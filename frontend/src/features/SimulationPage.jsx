import { useState, useEffect } from "react";
//import createCurrentState from "./metaData/constructionsStateMachine.js";
import { Building2, Check, ArrowRight, Play } from "lucide-react";
import OptionCardSelector from "./simulation/SimulationCard.jsx"
import createCurrentState from "./simulation/constructionsStateMachine.js"
import ProgressStepper, {Progress} from "./Progress.jsx"
import TitleComponent from "./buildingDT/TitleComponent.jsx"
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SpaceTypeAssignmentPage from "./simulation/SpaceTypeAssignmentPage.jsx"


const initialSpacesCZ4 = {
   "Space OfficeL": "189.1-2009 - Office - BreakRoom - CZ1-3" ,
   "Space OfficeS": "189.1-2009 - Office - BreakRoom - CZ1-3" ,
   "Space Conference": "189.1-2009 - Office - BreakRoom - CZ1-3" ,
   "Space Kitchen": "189.1-2009 - Office - BreakRoom - CZ1-3" ,
   "Space OfficeM": "189.1-2009 - Office - BreakRoom - CZ1-3" ,
   "Space BreakRoom": "189.1-2009 - Office - BreakRoom - CZ1-3" ,
   "Space no hvac 1": "189.1-2009 - Office - BreakRoom - CZ1-3" ,
   "Space no hvac 2": "189.1-2009 - Office - BreakRoom - CZ1-3" ,
   "Space no hvac 3": "189.1-2009 - Office - BreakRoom - CZ1-3" 
};

function OptionSelector({
  currentState,
  setCurrentState,
  formData,
  setFormData,
  handleSubmit,
  isLastState,
}) {
  const hasSelection = currentState.selectedKey
    ? Boolean(formData[currentState.selectedKey])
    : true;

  function handleNext() {
    if (!hasSelection) return;
    if (!currentState.nextState) return;

    setCurrentState(createCurrentState(currentState.nextState));
  }

  return (
    <div className="mx-auto flex h-[75vh] w-full max-w-[920px] flex-col">
      <OptionCardSelector
        title={currentState.title}
        subtitle={currentState.subtitle}
        badge={currentState.badge}
        type={currentState.type}
        options={currentState.options}
        selectedValue={formData[currentState.selectedKey]}
        onSelect={(value) => {
          setFormData((previous) => ({
            ...previous,
            [currentState.selectedKey]: value,
          }));
        }}
         component={currentState.component}
         formData={formData}
         selectedKey={currentState.selectedKey}
      />

      <div className="mt-6 flex h-11 shrink-0 justify-end">
        <button
          type="button"
          onClick={isLastState ? handleSubmit : handleNext}
          disabled={!hasSelection}
          className={`
            flex h-11 items-center gap-2 rounded-full px-6
            text-sm font-semibold transition
            ${
              hasSelection
                ? isLastState
                  ? "bg-green-600 text-white shadow-sm hover:bg-green-700"
                  : "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                : "cursor-not-allowed bg-slate-200 text-slate-400"
            }
          `}
        >
          {isLastState ? "Start Simulation" : "Next"}

          {isLastState ? (
            <Play size={17} />
          ) : (
            <ArrowRight size={17} />
          )}
        </button>
      </div>
    </div>
  );
}


export default function SimulationPage() {
  const [currentState, setCurrentState] = useState(
    createCurrentState("selectBuilding")
  );
  const [email, setEmail] = useState('');
  const [spaces, setSpaces] = useState(initialSpacesCZ4);
  const [showError, setShowError] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [pythonFile, setPythonFile] = useState(null);

  function normalizeOptions(data) {
  if (!Array.isArray(data)) {
    console.error("Expected array from backend, got:", data);
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    value: item.name,
    label: item.name,
    description: "Construction Set",
    icon: "construction",
  }));
}

async function setNextState(nextState) {
  let updatedNextState = {
    ...nextState,
  };

  if (updatedNextState.options === null) {
    const token = localStorage.getItem("token");

    const response = await axios.get(updatedNextState.url, {
      params: {
        id: "0",
      },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const newData = response.data.componentDescriptions.componentParts;

    updatedNextState = {
      ...updatedNextState,
      options: normalizeOptions(newData),
    };
  }

  setCurrentState(updatedNextState);
}

  const [formData, setFormData] = useState({
    building: "",
    constructionSet: "",
    environment: "",
    hvacSystem: "",
  });
  
  function previousState(nextState, test){
    setNextState(createCurrentState(nextState));
  }

  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem('email'); // Assurez-vous que l'email est bien stocké lors de la connexion
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      console.error('No email found in localStorage.');
    }
  }, []);

  function updateSpaceType(spaceName, selectedSpaceType) {
    setSpaces((previousSpaces) => ({
      ...previousSpaces,
      [spaceName]: selectedSpaceType
    }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.building || !formData.environment || !formData.hvacSystem) {
      setShowError(true);
      return;
    }

    setShowError(false);
    const formDataToSend = new FormData();
    formDataToSend.append('constructionSet', formData.constructionSet);
    formDataToSend.append('spaces', JSON.stringify(spaces));
    formDataToSend.append('building', formData.building);
    formDataToSend.append('environment', formData.environment);
    formDataToSend.append('hvacSystem', formData.hvacSystem);
    formDataToSend.append('userEmail', email);
    if (pythonFile) {
      formDataToSend.append('pythonFile', pythonFile); // Append the file
    }

    console.log(JSON.stringify(formData.spaces));
    
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    console.log('Request data:', formDataToSend);

    try {
      const response = await axios.post('http://localhost:8080/api/simulations/start-simulation', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`, // Inclure le token d'authentification
          'Content-Type': 'multipart/form-data',
        },
      });
      setSnackbarMessage('Simulation started successfully!');
      setSnackbarSeverity('success');
      console.log('Response received:', response.data);
      navigate(`/simulation?simulationId=${response.data.simulation_id}&status=${response.data.status}`);
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Failed to start simulation. Please try again.';
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };

  return (
    <div className="ml-64 h-screen overflow-auto bg-slate-50 px-6 ">
      <TitleComponent
        category={currentState.title}
        goToNextState={previousState}
        previousState={currentState.previousState}
        progress={<Progress 
          steps={[
            "BUILDING",
            "CONSTRUCTION SET",
            "SPACES",
            "CITY",
            "HVAC"
          ]}
          currentStep={currentState.progressStep}
        />}
      />

      <div className="mx-auto mt-[110px] w-full max-w-[1100px] rounded-2xl border border-slate-200 bg-white px-8 py-8 shadow-sm">
        <OptionSelector 
          currentState={currentState} setCurrentState={setNextState}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          isLastState={currentState.nextState === null}
        />
        
        </div>
    </div>
  );
}

/*
<OptionSelector 
          currentState={currentState} setCurrentState={setCurrentState}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          isLastState={currentState.progressStep === "REVIEW"}
        />

        <SpaceTypeAssignment />

*/
