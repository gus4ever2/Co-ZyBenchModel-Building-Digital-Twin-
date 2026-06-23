function SimulationConfiguration({ simulationData, setSimulationData }) {
  function updateField(fieldName, value) {
    setSimulationData((previous) => ({
      ...previous,
      [fieldName]: value,
    }));
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-blue-600">▣</span>
        <h2 className="text-lg font-semibold text-gray-900">
          Simulation Configuration
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Run Period Name
          </label>
          <input
            type="text"
            value={simulationData.Name}
            onChange={(event) => updateField("Name", event.target.value)}
            className="w-full rounded-md border border-gray-400 px-3 py-2 text-sm"
            placeholder="Run Period 1"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Day of Week for Start Day
          </label>
          <select
            value={simulationData.Day_of_Week_for_Start_Day}
            onChange={(event) =>
              updateField("Day_of_Week_for_Start_Day", event.target.value)
            }
            className="w-full rounded-md border border-gray-400 px-3 py-2 text-sm"
          >
            <option value="">Select day</option>
            <option value="Sunday">Sunday</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Begin Month
          </label>
          <input
            type="number"
            min="1"
            max="12"
            step="1"
            value={simulationData.Begin_Month}
            onChange={(event) => updateField("Begin_Month", event.target.value)}
            className="w-full rounded-md border border-gray-400 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Begin Day of Month
          </label>
          <input
            type="number"
            min="1"
            max="31"
            step="1"
            value={simulationData.Begin_Day_of_Month}
            onChange={(event) =>
              updateField("Begin_Day_of_Month", event.target.value)
            }
            className="w-full rounded-md border border-gray-400 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Begin Year
          </label>
          <input
            type="number"
            min="1900"
            max="2100"
            step="1"
            value={simulationData.Begin_Year}
            onChange={(event) => updateField("Begin_Year", event.target.value)}
            className="w-full rounded-md border border-gray-400 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            End Month
          </label>
          <input
            type="number"
            min="1"
            max="12"
            step="1"
            value={simulationData.End_Month}
            onChange={(event) => updateField("End_Month", event.target.value)}
            className="w-full rounded-md border border-gray-400 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            End Day of Month
          </label>
          <input
            type="number"
            min="1"
            max="31"
            step="1"
            value={simulationData.End_Day_of_Month}
            onChange={(event) =>
              updateField("End_Day_of_Month", event.target.value)
            }
            className="w-full rounded-md border border-gray-400 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            End Year
          </label>
          <input
            type="number"
            min="1900"
            max="2100"
            step="1"
            value={simulationData.End_Year}
            onChange={(event) => updateField("End_Year", event.target.value)}
            className="w-full rounded-md border border-gray-400 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Number of Timesteps per Hour
          </label>
          <select
            value={simulationData.Number_of_Timesteps_per_Hour}
            onChange={(event) =>
              updateField("Number_of_Timesteps_per_Hour", event.target.value)
            }
            className="w-full rounded-md border border-gray-400 px-3 py-2 text-sm"
          >
            <option value="">Select timestep</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="10">10</option>
            <option value="12">12</option>
            <option value="15">15</option>
            <option value="20">20</option>
            <option value="30">30</option>
            <option value="60">60</option>
          </select>
        </div>
      </div>
    </section>
  );
}

export default SimulationConfiguration;