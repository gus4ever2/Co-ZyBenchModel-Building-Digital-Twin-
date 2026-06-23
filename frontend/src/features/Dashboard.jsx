import React, { useEffect, useState }  from 'react';
import { Activity, Zap, Thermometer, LineChart, PlusCircle } from 'lucide-react';
import {Link } from 'react-router-dom';
import DashboardCard from '../utils/components/DashboardCard';
import { mockMetrics} from '../data/mockData';
import axios from 'axios';

export default function Dashboard() {

  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the connected user's simulations
  useEffect(() => {
    const fetchSimulations = async () => {
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('email');

      if (!token || !userEmail) {
        setError('User not authenticated.');
        setLoading(false);
        return;
      }


      try {
        const response = await axios.get(`http://localhost:8080/api/simulations/users/${userEmail}/simulations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('request sent');

        // Sort simulations by timestamp (most recent first) and take the first three
        const sortedSimulations = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 3);
        console.log('sortedSimulations:', sortedSimulations);
        setSimulations(sortedSimulations);
      } catch (err) {
        console.error('Error fetching simulations:', err);
        setError('Failed to fetch simulations.');
      } finally {
        setLoading(false);
      }
    };

    fetchSimulations();
  }, []);

  if (loading) {
    return <div className="p-8 ml-64">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 ml-64 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 ml-64">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your simulation overview.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Active Simulations"
            value={mockMetrics.activeSimulations}
            icon={<Activity className="w-6 h-6 text-blue-600" />}
            trend={mockMetrics.trends.activeSimulations}
          />
          <DashboardCard
            title="Energy Consumption"
            value={`${mockMetrics.energyConsumption} kWh`}
            icon={<Zap className="w-6 h-6 text-yellow-600" />}
            trend={mockMetrics.trends.energyConsumption}
          />
          <DashboardCard
            title="Avg. Comfort Score"
            value={mockMetrics.avgComfortScore}
            icon={<Thermometer className="w-6 h-6 text-green-600" />}
            trend={mockMetrics.trends.avgComfortScore}
          />
          <DashboardCard
            title="Carbon Emission"
            value={`${mockMetrics.carbonEmission} kg`}
            icon={<LineChart className="w-6 h-6 text-red-600" />}
            trend={mockMetrics.trends.carbonEmission}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Simulations</h3>
            <div className="space-y-4">
            {simulations.map((simulationWithScenario) => (
                <div key={simulationWithScenario.simulation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {simulationWithScenario.scenario.building} - {simulationWithScenario.scenario.envConditions}
                    </p>
                    <p className="text-sm text-gray-600">
                      Started {new Date(simulationWithScenario.simulation.start_time).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      HVAC System: {simulationWithScenario.scenario.hvacSystem}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      simulationWithScenario.simulation.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {simulationWithScenario.simulation.status.charAt(0).toUpperCase() + simulationWithScenario.simulation.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/customized"
                className="p-4 text-left bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
              >
                <PlusCircle className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium">New Simulation</p>
                <p className="text-sm text-gray-600">Configure and start a new simulation</p>
              </Link>
              <Link
                to="/history"
                className="p-4 text-left bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
              >
                <Activity className="w-6 h-6 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium">View Reports</p>
                <p className="text-sm text-gray-600">Access simulation analytics</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}