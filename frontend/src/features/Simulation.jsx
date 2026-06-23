import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useLocation } from "react-router-dom";

export default function Simulation() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const simulationId = queryParams.get("simulationId");

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("RUNNING"); // Default status
  const [isCompleted, setIsCompleted] = useState(false); // Indicateur pour la fin de la simulation

  useEffect(() => {
    if (!simulationId || isCompleted) return;

    const eventSource = new EventSource(`http://localhost:5000/real-time-data/${simulationId}`);

    eventSource.onmessage = (event) => {
      try {
        const newBlock = JSON.parse(event.data);
        console.log("New block received:", newBlock);

        if (newBlock.status === "COMPLETED") {
          setIsCompleted(true);
          setStatus("COMPLETED");
          eventSource.close(); // Ferme la connexion SSE
          alert("Simulation completed! You can now review the final results.");
          return;
        }

        // 检查是否包含日期数据
        const [date, values] = Object.entries(newBlock)[0];
        
        // 验证日期格式是否为YYYY-MM-DD HH:mm
        const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
        if (!dateRegex.test(date)) {
          // console.log("Skipping non-date data:", newBlock);
          return;
        }

        const newResult = {
          timestamp: date,
          energyConsumption: values.heating_consumption || 0,
          thermalComfortScore: values.total_itc || 0,
          carbonEmission: values.cooling_consumption || 0,
          equality:
            Object.values(values.equality || {}).reduce((sum, value) => sum + value, 0) /
            Object.keys(values.equality || {}).length,
          ...values.itc, // Ajoute les données ITC pour chaque zone
        };

        setResults((prevResults) => [...prevResults, newResult]);
        setLoading(false); // Arrête le chargement
      } catch (error) {
        console.error("Error processing real-time data:", error);
      }
    };

    eventSource.onerror = () => {
      console.warn("SSE connection lost.");
      if (!isCompleted) {
        console.log("Simulation still running. Retrying...");
      }
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [simulationId, isCompleted]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/simulations/${simulationId}/status`, {
          headers: {
            'Authorization': `Bearer ${token}`, // Inclure le token d'authentification
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setStatus(data.status);

        if (data.status === "COMPLETED") {
          setIsCompleted(true);
          console.log("Simulation completed via status check.");
          alert("Simulation completed! You can now review the final results.");
        }
      } catch (err) {
        console.error("Error fetching status:", err);
        setError("Failed to fetch simulation status.");
      }
    };

    if (!isCompleted) {
      const interval = setInterval(fetchStatus, 20000); // Vérifie toutes les 20 secondes
      return () => clearInterval(interval);
    }
  }, [simulationId, isCompleted]);

  if (loading) {
    return <div className="p-8 ml-64">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 ml-64 text-red-500">Error: {error}</div>;
  }

  const metrics = [
    { key: "energyConsumption", name: "Energy Consumption (kWh)", color: "#2563eb" },
    { key: "thermalComfortScore", name: "Thermal Comfort Score", color: "#16a34a" },
    { key: "carbonEmission", name: "Carbon Emission (kg)", color: "#dc2626" },
    { key: "equality", name: "Equality", color: "#ffa500" },
  ];

  const handleDownload = (simulation) => {
    const json = JSON.stringify(simulation, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `my_simulation_results.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 ml-64">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Running Simulation</h1>
        <p className="text-gray-600 mt-2">View your results in real-time</p>
      </header>

      {metrics.map((metric) => (
        <div key={metric.key} className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">{metric.name}</h2>
          <div className="w-full overflow-x-auto">
            <LineChart width={800} height={400} data={results}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey={metric.key}
                stroke={metric.color}
                name={metric.name}
              />
            </LineChart>
          </div>
        </div>
      ))}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">ITC Zones</h2>
          <div className="w-full overflow-x-auto">
            <LineChart width={800} height={400} data={results}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Array.from({ length: 18 }, (_, i) => (
                <Line
                  key={`itc_${i + 1}`}
                  type="monotone"
                  dataKey={String(i + 1)}
                  stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`} // Random color for each line
                  name={`ITC Zone ${i + 1}`}
                />
              ))}
            </LineChart>
          </div>
        </div>

        <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click event
                          handleDownload(results);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Download results as JSON
                      </button>

    </div>
  );
}
