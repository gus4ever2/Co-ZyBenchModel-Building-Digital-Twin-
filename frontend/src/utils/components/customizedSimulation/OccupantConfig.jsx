import React, { useState } from 'react';
import { Users } from 'lucide-react';
import FileUpload from './FileUpload';
import { Upload } from 'lucide-react';

export default function OccupantConfig() {
  const [occupantConfig, updateOccupantConfig] = useState({
    count: 1,
    profiles: [],
    startTime: '',
    endTime: '',
  });
  const [profileInput, setProfileInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateOccupantConfig((prevConfig) => ({
      ...prevConfig,
      [name]: value,
    }));
  };

  const handleFileChange = (name, file) => {
    setUploadedFiles((prevFiles) => ({
      ...prevFiles,
      [name]: file,
    }));
  };

  const handleProfileInputChange = (e) => {
    setProfileInput(e.target.value);
  };

  const addProfile = () => {
    if (profileInput.trim()) {
      updateOccupantConfig((prevConfig) => ({
        ...prevConfig,
        profiles: [...prevConfig.profiles, profileInput.trim()],
      }));
      setProfileInput('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-medium">Occupant Configuration</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Occupants
          </label>
          <input
            type="number"
            name="count"
            value={occupantConfig.count}
            onChange={handleChange}
            min="1"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Add Occupant Profile
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={profileInput}
              onChange={handleProfileInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter profile type"
            />
            <button
              onClick={addProfile}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="mt-2">
            <ul className="list-disc pl-5 text-gray-700">
              {occupantConfig.profiles.map((profile, index) => (
                <li key={index}>{profile}</li>
              ))}
            </ul>
          </div>
        </div>

        <FileUpload
          label="Occupant trajectories"
          accept=".csv"
          icon={<Upload className="w-6 h-6 text-gray-400" />}
          description="Upload CSV file"
          name="trajectories"
          onFileChange={handleFileChange}
        />

        <FileUpload
          label="Events and schedules"
          accept=".json"
          icon={<Upload className="w-6 h-6 text-gray-400" />}
          description="Upload JSON file"
          name="events"
          onFileChange={handleFileChange}
        />
      </div>
    </div>
  );
}
