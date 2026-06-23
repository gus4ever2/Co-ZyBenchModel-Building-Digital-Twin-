import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Building2, AlertCircle, Upload} from 'lucide-react';
import SimulationConfiguration from "../utils/components/SimulationConfiguration.jsx"

const buildings = [
  { label: 'Small Office', value: 'small_office', size: '510.97 m²', floors: 1, zones: 6 },
  { label: 'Medium Office', value: 'medium_office', size: '4983.22 m²', floors: 3, zones: 18 },
  { label: 'Large Office', value: 'large_office', size: '46314.19 m²', floors: 12, zones: 72 },
  { label: 'Primary School', value: 'primary_school', size: '6871.80 m²', floors: 1, zones: 25 },
  { label: 'Secondary School', value: 'secondary_school', size: '19585.89 m²', floors: 2, zones: 46 },
];

const spaceTypeOptions = [
  {
    "internalName": "BREAKROOM_CZ1_3",
    "displayName": "189.1-2009 - Office - BreakRoom - CZ1-3"
  },
  {
    "internalName": "BREAKROOM_CZ4_8",
    "displayName": "189.1-2009 - Office - BreakRoom - CZ4-8"
  },
  {
    "internalName": "CLOSEDOFFICE_CZ1_3",
    "displayName": "189.1-2009 - Office - ClosedOffice - CZ1-3"
  },
  {
    "internalName": "CLOSEDOFFICE_CZ4_8",
    "displayName": "189.1-2009 - Office - ClosedOffice - CZ4-8"
  },
  {
    "internalName": "CONFERENCE_CZ1_3",
    "displayName": "189.1-2009 - Office - Conference - CZ1-3"
  },
  {
    "internalName": "CONFERENCE_CZ4_8",
    "displayName": "189.1-2009 - Office - Conference - CZ4-8"
  },
  {
    "internalName": "LOBBY_CZ1_3",
    "displayName": "189.1-2009 - Office - Lobby - CZ1-3"
  },
  {
    "internalName": "LOBBY_CZ4_8",
    "displayName": "189.1-2009 - Office - Lobby - CZ4-8"
  },
  {
    "internalName": "OPENOFFICE_CZ1_3",
    "displayName": "189.1-2009 - Office - OpenOffice - CZ1-3"
  },
  {
    "internalName": "OPENOFFICE_CZ4_8",
    "displayName": "189.1-2009 - Office - OpenOffice - CZ4-8"
  },
]

const initialSpacesCZ4 = {
   "Space OfficeL": "" ,
   "Space OfficeS": "" ,
   "Space Conference": "" ,
   "Space Kitchen": "" ,
   "Space OfficeM": "" ,
   "Space BreakRoom": "" ,
   "Space no hvac 1": "" ,
   "Space no hvac 2": "" ,
   "Space no hvac 3": "" 
};

const constructionSets = [
  {
    value: "189_1_2009_CZ1_Office",
    label: "189.1-2009 - CZ1 - Office",
    description: "Office construction set for Climate Zone 1",
    icon: "construction"
  },
  {
    value: "189_1_2009_CZ2_Office",
    label: "189.1-2009 - CZ2 - Office",
    description: "Office construction set for Climate Zone 2",
    icon: "construction"
  },
  {
    value: "189_1_2009_CZ3_Office",
    label: "189.1-2009 - CZ3 - Office",
    description: "Office construction set for Climate Zone 3",
    icon: "construction"
  },
  {
    value: "189_1_2009_CZ4_Office",
    label: "189.1-2009 - CZ4 - Office",
    description: "Office construction set for Climate Zone 4",
    icon: "construction"
  },
  {
    value: "189_1_2009_CZ5_Office",
    label: "189.1-2009 - CZ5 - Office",
    description: "Office construction set for Climate Zone 5",
    icon: "construction"
  },
  {
    value: "189_1_2009_CZ6_Office",
    label: "189.1-2009 - CZ6 - Office",
    description: "Office construction set for Climate Zone 6",
    icon: "construction"
  },
  {
    value: "189_1_2009_CZ7_8_Office",
    label: "189.1-2009 - CZ7-8 - Office",
    description: "Office construction set for Climate Zones 7 and 8",
    icon: "construction"
  }
];

const environments = [
  { city: 'Mumbai', cz: 'Extreme Hot Humid', wall: '3.4 cm', window: '2.1 W/mK', roof: '17 cm' },
  { city: 'Cairo', cz: 'Hot Dry', wall: '4.5 cm', window: '0.042 W/mK', roof: '21 cm' },
  { city: 'Los Angeles', cz: 'Warm Dry', wall: '5.6 cm', window: '0.019 W/mK', roof: '21 cm' },
  { city: 'Paris', cz: 'Mixed Humid', wall: '6.8 cm', window: '0.013 W/mK', roof: '21 cm' },
  { city: 'Scranton', cz: 'Cool Humid', wall: '7.9 cm', window: '0.013 W/mK', roof: '21 cm' },
];

const systems = [
  { value: 'CAV', label: 'Constant Air Volume (CAV)', description: 'Traditional system with fixed airflow rates' },
  { value: 'VAV', label: 'Variable Air Volume (VAV)', description: 'Adjustable airflow for better energy efficiency' },
  { value: 'VRF', label: 'Variable Refrigerant Flow (VRF)', description: 'Advanced system with precise zone control' },
];

const occupantTypes = [
  { value: 'office', label: 'Office Building Occupants', schedule: '8 AM - 6 PM, Mon-Fri' },
  { value: 'school', label: 'School Occupants', schedule: '7 AM - 4 PM, Mon-Fri' },
  { value: 'hotel', label: 'Hotel Occupants', schedule: '24/7 with varying density' },
  { value: 'hospital', label: 'Hospital Occupants', schedule: '24/7 with shift changes' },
];



function FirstPage({formData, setFormData, setPage, pythonFile, setPythonFile}){
  const [showError, setShowError] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.building || !formData.environment || !formData.hvacSystem) {
      setShowError(true);
      return;
    }

    setShowError(false);  

    setPage("second");
  };

  const handleReset = () => {
    setFormData({
      building: '',
      constructionSet:'',
      environment: '',
      hvacSystem: '',
    });
    setPythonFile(null);
    setShowError(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.py')) {
      setPythonFile(file);
    } else {
      setSnackbarMessage('Please upload a valid Python file (.py).');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  return(
    <>
      <div className="ml-64 min-h-screen bg-gray-50">
        <div className="max-w-[calc(100%-2rem)] mx-auto py-8">
          <div className="flex items-center gap-3 mb-8">
            <Building2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Building Simulation Configuration</h1>
          </div>

          {showError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>Please fill in all required fields to continue.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Building Selection */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Building Type</h2>
              <div className="grid gap-3">
                {buildings.map((building) => (
                  <label
                    key={building.value}
                    className="flex items-start p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="building"
                      value={building.value}
                      checked={formData.building === building.value}
                      onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                      className="mt-1 mr-3"
                      required
                    />
                    <div>
                      <div className="font-medium">{building.label}</div>
                      <div className="text-sm text-gray-600">
                        Size: {building.size} • Floors: {building.floors} • Zones: {building.zones}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Environment Selection */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Environmental Conditions</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 border text-left">City</th>
                      <th className="px-4 py-2 border text-left">Climate Zone</th>
                      <th className="px-4 py-2 border text-left">Wall Insulation</th>
                      <th className="px-4 py-2 border text-left">Window Conductivity</th>
                      <th className="px-4 py-2 border text-left">Roof Insulation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {environments.map((env) => (
                      <tr key={env.city} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="environment"
                              value={env.city}
                              checked={formData.environment === env.city}
                              onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                              className="mr-2"
                              required
                            />
                            {env.city}
                          </label>
                        </td>
                        <td className="px-4 py-2 border">{env.cz}</td>
                        <td className="px-4 py-2 border">{env.wall}</td>
                        <td className="px-4 py-2 border">{env.window}</td>
                        <td className="px-4 py-2 border">{env.roof}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* HVAC System Selection */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">HVAC System</h2>
              <div className="grid gap-3">
                {systems.map((system) => (
                  <label
                    key={system.value}
                    className="flex items-start p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="hvacSystem"
                      value={system.value}
                      checked={formData.hvacSystem === system.value}
                      onChange={(e) => setFormData({ ...formData, hvacSystem: e.target.value })}
                      className="mt-1 mr-3"
                      required
                    />
                    <div>
                      <div className="font-medium">{system.label}</div>
                      <div className="text-sm text-gray-600">{system.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Python File Upload */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Upload Python File</h2>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 cursor-pointer">
                  <Upload className="w-5 h-5" />
                  <span>{pythonFile ? pythonFile.name : 'Choose a Python file (.py)'}</span>
                  <input
                    type="file"
                    accept=".py"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                next
              </button>
            </div>
          </form>

          {/* Snackbar */}
          {snackbarOpen && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 shadow-lg rounded-lg px-4 py-3">
              <span
                className={`text-sm font-medium ${
                  snackbarSeverity === 'success' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {snackbarMessage}
              </span>
              <button
                onClick={handleCloseSnackbar}
                className="text-gray-500 hover:text-gray-700 focus:outline-none ml-4"
              >
                ✖
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SpacesWithSpaceTypeSelect({ spaces, updateSpaceType }) {
  return (
    <section className="w-full">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-gray-900">
          Space Type Assignment
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose the correct space type for each space.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(spaces).map(([spaceName, selectedSpaceType]) => (
          <div
            key={spaceName}
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className="mb-3">
              <h3 className="text-sm font-medium text-gray-900">
                {spaceName}
              </h3>
            </div>

            <select
              value={selectedSpaceType}
              onChange={(event) =>
                updateSpaceType(spaceName, event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-gray-500 focus:bg-white"
            >
              <option value="">Select space type</option>

              {spaceTypeOptions.map((option) => (
                <option key={option.internalName} value={option.displayName}>
                  {option.displayName}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </section>
  );
}

function ConstructionSet({formData, setFormData}) {
  return (
    <section className="w-full">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-gray-900">
          Construction Set Assignment
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Choose the construction set for the building model.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {constructionSets.map((set) => {
          const selected = formData.constructionSet === set.value;

          return (
            <label
              key={set.value}
              className={`
                cursor-pointer rounded-xl border bg-white p-4 transition
                ${
                  selected
                    ? "border-blue-500 ring-2 ring-blue-100"
                    : "border-gray-200 hover:border-gray-300"
                }
              `}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="constructionSet"
                  value={set.value}
                  checked={selected}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      constructionSet: event.target.value,
                    })
                  }
                  className="mt-1 h-4 w-4 cursor-pointer accent-blue-600"
                  required
                />

                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {set.label}
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    {set.description}
                  </p>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}




function SecondPage({formData, setFormData, setPage, pythonFile}){
  const [email, setEmail] = useState('');
  const [spaces, setSpaces] = useState(initialSpacesCZ4);
  const [showError, setShowError] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  

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

  const handleReset = () => {
    setFormData({
      building: '',
      constructionSet:'',
      environment: '',
      hvacSystem: '',
    });
    setShowError(false);
    setPage("first");
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  return(
    <>
      <div className="ml-64 min-h-screen bg-gray-50">
        <div className="max-w-[calc(100%-2rem)] mx-auto py-8">
          <div className="flex items-center gap-3 mb-8">
            <Building2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Building Simulation Configuration</h1>
          </div>

          {showError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>Please fill in all required fields to continue.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Construction Set Selection */}
            
            <ConstructionSet formData={formData} setFormData={setFormData} />

            <SpacesWithSpaceTypeSelect spaces={spaces} setSpaces={setSpaces} updateSpaceType={updateSpaceType} />

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Start Simulation
              </button>
            </div>
          </form>

          {/* Snackbar */}
          {snackbarOpen && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 shadow-lg rounded-lg px-4 py-3">
              <span
                className={`text-sm font-medium ${
                  snackbarSeverity === 'success' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {snackbarMessage}
              </span>
              <button
                onClick={handleCloseSnackbar}
                className="text-gray-500 hover:text-gray-700 focus:outline-none ml-4"
              >
                ✖
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}


export const SimulationPage = () => {
  const [pythonFile, setPythonFile] = useState(null);
  const [page, setPage] = useState("first");
  const [formData, setFormData] = useState({
    building: '',
    constructionSet:'',
    spaceType:{},
    environment: '',
    hvacSystem: '',
  });

  return (
    <>
      {(page === "first") && <FirstPage formData={formData} setFormData={setFormData} setPage={setPage} pythonFile={pythonFile} setPythonFile={setPythonFile} />}
      {(page === "second") && <SecondPage formData={formData} setFormData={setFormData} setPage={setPage} pythonFile={pythonFile} />}
    </>
  );
};

export default SimulationPage;
