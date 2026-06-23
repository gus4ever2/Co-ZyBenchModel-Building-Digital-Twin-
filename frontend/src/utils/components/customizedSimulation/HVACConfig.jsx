import React, { useState } from 'react';
import { Fan } from 'lucide-react';
import { hvacSystems } from '../../../data/hvacSystems';

export default function HVACConfig() {
  const [hvacConfig, updateHVACConfig] = useState({
    systemType: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateHVACConfig((prevConfig) => ({
      ...prevConfig,
      [name]: value,
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Fan className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-medium">HVAC Configuration</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          HVAC System Type
        </label>
        <select
          name="systemType"
          value={hvacConfig.systemType}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select HVAC system</option>
          {hvacSystems.map((system) => (
            <option key={system.id} value={system.id}>
              {system.name} - {system.description}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
