import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../components/Home'; // Importez vos composants
import About from './features/About';
import Contact from './features/Contact';
import Documentation from './features/Documentation';
import History from './features/History';
import SimulationPage from './features/SimulationPage';
import Simulation from './features/Simulation';
import SignUp from './features/SignUp';
import SimulationConfig from './features/CustomizedConfig';
import BuildingDT from './features/buildingDT/BuildingDT';
import PlantSimulation from './features/plantSimulation/PlantSimulation';

const Routes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} /> {/* Page d'accueil */}
      <Route path="/configs" element={<SimulationPage />} />  {/* Page des Configs */}
      <Route path="/metrics" element={<MetricsCharts />} />  {/* Page Metrics */}
      <Route path="/simulation" element={<Simulation />} />  {/* Page Metrics */}
      <Route path="/about" element={<About />} />  
      <Route path="/contact" element={<Contact />} />  
      <Route path="/documentation" element={<Documentation />} />  
      <Route path="/login" element={<Login />} />  {/* login page */}
      <Route path="/signup" element={<SignUp />} />  {/* login page */}
      <Route path="/history" element={<History />} />  {/* history of simulations */}
      <Route path="/customized" element={<SimulationConfig />} /> 
      <Route path="/buildingDT" element={<BuildingDT />} />
      <Route path="/plantSimulation" element={<PlantSimulation />} /> 
    
      {/* Ajoutez d'autres routes si nécessaire */}
    </Routes>
  );
};

export default Routes;
