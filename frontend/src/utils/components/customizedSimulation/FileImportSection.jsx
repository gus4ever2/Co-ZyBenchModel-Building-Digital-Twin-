import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import FileUpload from './FileUpload';

export default function FileImportSection() {
  const [uploadedFiles, setUploadedFiles] = useState({});

  const handleFileChange = (name, file) => {
    setUploadedFiles((prevFiles) => ({
      ...prevFiles,
      [name]: file,
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FileUpload
        label="Building Model"
        accept=".idf,.json"
        icon={<Upload className="w-6 h-6 text-gray-400" />}
        description="Upload IDF or NGSI-LD file"
        name="buildingModel"
        onFileChange={handleFileChange}
      />
      
      <FileUpload
        label="Occupant Profiles"
        accept=".csv,.json"
        icon={<Upload className="w-6 h-6 text-gray-400" />}
        description="Upload CSV or JSON file"
        name="occupantProfiles"
        onFileChange={handleFileChange}
      />

      {/* Debugging section to visualize uploaded files */}
      <div className="col-span-2">
        <h3 className="text-lg font-medium text-gray-800">Uploaded Files</h3>
        <ul className="list-disc pl-6 mt-2">
          {Object.entries(uploadedFiles).map(([key, file]) => (
            <li key={key} className="text-gray-700">
              {key}: {file.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
