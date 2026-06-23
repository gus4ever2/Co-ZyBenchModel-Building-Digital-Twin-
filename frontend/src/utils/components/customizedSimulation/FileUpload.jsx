import React, { useState } from 'react';

export default function FileUpload({ label, accept, icon, description, name, onFileChange }) {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      onFileChange(name, selectedFile); // Inform the parent component
    }
  };
  const handleReset = () => {
    setFile(null); // Reset local state
    onFileChange(name, null); // Inform parent of the reset
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          id={name}
        />
        <label
          htmlFor={name}
          className="flex flex-col items-center justify-center w-full h-32 px-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
        >
          {icon}
          <span className="mt-2 text-sm text-gray-500">{description}</span>
          {file && (
            <span className="mt-2 text-sm text-blue-600">{file.name}</span>
          )}
        </label>
      </div>
      {file && (
        <button
          type="button"
          onClick={handleReset}
          className="mt-2 text-sm text-red-500 underline"
        >
          Reset
        </button>
      )}
    </div>
  );
}
