import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import { buildingTypes } from '../../../data/buildingTypes';

export default function BuildingConfig() {
  const [buildingConfig, updateBuildingConfig] = useState({
    name: '',
    type: '',
    area: 0,
    floors: 0,
    zones: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateBuildingConfig((prevConfig) => ({
      ...prevConfig,
      [name]: value,
    }));
  };
  const handleReset = () => {
    updateBuildingConfig({
      name: '',
      type: '',
      area: '',
      floors: '',
      zones: '',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-medium">Building Configuration</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Building Name
          </label>
          <input
            type="text"
            name="name"
            value={buildingConfig.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Building Type
          </label>
          <select
            name="type"
            value={buildingConfig.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select type</option>
            {buildingTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Area (m²)
          </label>
          <input
            type="number"
            name="area"
            value={buildingConfig.area}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Floors
          </label>
          <input
            type="number"
            name="floors"
            value={buildingConfig.floors}
            onChange={handleChange}
            min="1"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Zones
          </label>
          <input
            type="number"
            name="zones"
            value={buildingConfig.zones}
            onChange={handleChange}
            min="1"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={handleReset}
        className="mt-4 text-sm text-red-500 underline"
      >
        Reset
      </button>
    </div>
  );
}