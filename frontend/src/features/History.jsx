import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function History() {
  const [simulations, setSimulations] = useState([]); // Contains all simulations
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSimulation, setSelectedSimulation] = useState(null); // Selected simulation for the chart
  const [scenarios, setScenarios] = useState({}); // Stores scenario data for building names

  // Fetch simulations and scenarios
  const token = localStorage.getItem("token");
  const fetchSimulations = async () => {
    try {
      // Fetch simulations
      const simulationsResponse = await fetch("http://localhost:8080/api/simulations/all", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!simulationsResponse.ok) {
        throw new Error("Failed to fetch simulations.");
      }
      const simulationsData = await simulationsResponse.json();
      setSimulations(simulationsData); // Store simulations in state
      setSelectedSimulation(simulationsData[0]); // Select the first simulation by default

      // Fetch scenarios to get building names
      const scenariosResponse = await fetch("http://localhost:8080/api/scenarios/all", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!scenariosResponse.ok) {
        throw new Error("Failed to fetch scenarios.");
      }
      const scenariosData = await scenariosResponse.json();
      console.log("Scenarios data:", scenariosData);
      const scenariosMap = scenariosData.reduce((acc, scenario) => {
        acc[scenario.id] = scenario.building + " "+ scenario.envConditions; // Map scenario ID to building name
        return acc;
      }, {});
      setScenarios(scenariosMap); // Store scenarios in state
      console.log("Scenarios map:", scenariosMap);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulations();
  }, []);

  // Format data for the chart
  const formatChartData = (results) => {
    return results.map((result) => {
      const date = Object.keys(result)[0];
      return {
        date,
        ...result[date],
      };
    });
  };

  // Get the last day's results for a simulation
  const getLastDayResults = (results) => {
    if (!results || results.length === 0) return null;
    const lastResult = results[results.length - 1];
    const lastDate = Object.keys(lastResult)[0];
    return lastResult[lastDate];
  };

  // Handle download of simulation results as JSON
  const handleDownload = (simulation) => {
    const json = JSON.stringify(simulation, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `simulation_${simulation.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="p-8 ml-64">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 ml-64 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8 ml-64">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Simulation History</h1>
        <p className="text-gray-600 mt-2">View and analyze your past simulation results</p>
      </header>

      {/* Chart Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Performance Trends</h2>
        <div className="w-full overflow-x-auto">
          {selectedSimulation ? (
            <LineChart
              width={800}
              height={400}
              data={formatChartData(selectedSimulation.results)} // Use results of the selected simulation
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="heating_consumption"
                stroke="#2563eb"
                name="Heating Consumption"
              />
              <Line
                type="monotone"
                dataKey="cooling_consumption"
                stroke="#16a34a"
                name="Cooling Consumption"
              />
              <Line
                type="monotone"
                dataKey="total_itc"
                stroke="#dc2626"
                name="ITC Total"
              />
            </LineChart>
          ) : (
            <p className="text-gray-500">No data available for the selected simulation.</p>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Detailed Results</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Building Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Heating (kWh)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cooling (kWh)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ITC Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Download
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {simulations.map((simulation) => {
                const lastDayResults = getLastDayResults(simulation.results);
                const buildingName = simulation.scenarioId ? scenarios[simulation.scenarioId] : "N/A";
                return (
                  <tr
                    key={simulation.id}
                    className={`cursor-pointer hover:bg-gray-100 ${
                      selectedSimulation?.id === simulation.id ? "bg-gray-200" : ""
                    }`}
                    onClick={() => setSelectedSimulation(simulation)} // Update selected simulation
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {simulation.startTime
                        ? new Date(simulation.startTime).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {buildingName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lastDayResults?.heating_consumption || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lastDayResults?.cooling_consumption || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lastDayResults?.total_itc || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click event
                          handleDownload(simulation);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}