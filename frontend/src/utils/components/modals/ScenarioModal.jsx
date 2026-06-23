import React from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Sliders, Building } from 'lucide-react';

export function ScenarioModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-6">Choose Your Scenario</h2>
        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => window.location.href = '/customized'}
            className="flex items-center justify-center gap-3 p-6 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition"
          >
            <Sliders className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <h3 className="font-semibold text-lg">Customized Scenario</h3>
              <p className="text-gray-600 text-sm">Create your own simulation parameters</p>
            </div>
          </button>
          
          <button
            onClick={() => window.location.href = '/configs'}
            className="flex items-center justify-center gap-3 p-6 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition"
          >
            <Building className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <h3 className="font-semibold text-lg">Reference Scenario</h3>
              <p className="text-gray-600 text-sm">Use pre-configured benchmark settings</p>
            </div>
          </button>
        </div>
      </div>
    </Modal>
  );
}