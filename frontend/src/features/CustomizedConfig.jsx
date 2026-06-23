import React, { useState } from 'react';
import FileImportSection from '../utils/components/customizedSimulation/FileImportSection';
import BuildingConfig from '../utils/components/customizedSimulation/BuildingConfig';
import OccupantConfig from '../utils/components/customizedSimulation/OccupantConfig';
import HVACConfig from '../utils/components/customizedSimulation/HVACConfig';

export default function SimulationConfig() {
  const [isLoading, setIsLoading] = useState(false);
  const [simulationId, setSimulationId] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="p-8 ml-64">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configure Simulation</h1>
        <p className="text-gray-600 mt-2">
          Customize your simulation scenario by importing files or manual configuration
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">1. Import Configuration Files</h2>
          <FileImportSection />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">2. Manual Configuration</h2>
          <div className="space-y-6">
            <BuildingConfig />
            <OccupantConfig />
            <HVACConfig />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">3. Start Simulation</h2>
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {simulationId && (
            <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg">
              Simulation started successfully! ID: {simulationId}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Starting Simulation...' : 'Start Simulation'}
          </button>
        </div>
      </form>
    </div>
  );
}