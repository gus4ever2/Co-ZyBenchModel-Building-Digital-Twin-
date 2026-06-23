import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';  
import NavBar from './utils/components/newNavbar'; 
import {Navbar} from './utils/components/navigation/Navbar'; 
//import Sidebar from './utils/components/sideBar';
import SimulationPage from './features/SimulationPage';
import {Hero} from './utils/components/sections/Hero';
import {Features} from './utils/components/sections/Features';
import {Showcase} from './utils/components/sections/Showcase';
import {Footer} from './utils/components/navigation/Footer';
import Home from './features/Home';  
import logo from './logo.svg';  
import About from './features/About';
import Contact from './features/Contact';
import Documentation from './features/Documentation';
import History from './features/History';
import Login from './features/Login';
import './App.css';
import Dashboard from './features/Dashboard';
import Simulation from './features/Simulation';
import SignUp from './features/SignUp';
import SimulationConfig from './features/CustomizedConfig';
import BuildingDT from './features/buildingDT/BuildingDT';
import PlantSimulation from './features/plantSimulation/PlantSimulation';
 
 function PrivateRoute({ children }) {
  console.log('localStorage:', localStorage);
   const token = localStorage.getItem('token');
   return token ? <>{children}</> : <Navigate to="/login" />;
 }

const App = () => {
  return (
    <div className="App">
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={
              <>
                <Navbar />
                <Hero />
                <Features />
                <Showcase />
                <Footer />
              </>
            } />  {/* Page d'accueil */}
            <Route path="/configs" element={
              <PrivateRoute>
              <div className="min-h-screen bg-gray-50">
                <NavBar />
                <SimulationPage />
              </div>
              </PrivateRoute>} />  {/* Page des Configs */}
            <Route path="/about" element={
              <div className="min-h-screen bg-gray-50">
                <NavBar />
                <About />
              </div>
              } />  
            <Route path="/contact" element={
              <div className="min-h-screen bg-gray-50">
                <NavBar />
                <Contact />
                </div>
              } />  
            <Route path="/documentation" element={
              <div className="min-h-screen bg-gray-50">
                <NavBar />
                <Documentation />
                </div>
                } />  
            <Route path="/login" element={<Login />} />  {/* login page */}
            <Route path="/history" element={
              <PrivateRoute>
              <div className="min-h-screen bg-gray-50">
                <NavBar />
                <History />
              </div>
            </PrivateRoute>
            } />  {/* history of simulations */}
            <Route path="/dashboard" element={
              <PrivateRoute>
              <div className="min-h-screen bg-gray-50">
                <NavBar />
                <Dashboard />
              </div>
            </PrivateRoute>
            } />  {/* history of simulations */}
             <Route path="/simulation" element={
              <PrivateRoute>
              <div className="min-h-screen bg-gray-50">
                <NavBar />
                <Simulation />
              </div>
            </PrivateRoute>
            } />  
            <Route path="/signup" element={
              //<PrivateRoute>
              <div className="min-h-screen bg-gray-50">
                <SignUp />
              </div>
            //</PrivateRoute>
            } />
            <Route path="/customized" element={
              <PrivateRoute>
              <div className="min-h-screen bg-gray-50">
                <NavBar />
                <SimulationConfig />
              </div>
            </PrivateRoute>
            } />

            
            <Route path="/buildingDT" element={
              <PrivateRoute>
              <div className="min-h-screen bg-gray-50">
                <NavBar />
                <BuildingDT/>
              </div>
            </PrivateRoute>
            } />

            <Route path="/plantSimulation" element={
              <PrivateRoute>
              <div className="min-h-screen bg-gray-50">
                <NavBar />
                <PlantSimulation/>
              </div>
            </PrivateRoute>
            } />



          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
