import React, { useState } from 'react';
import { ScenarioModal } from '../modals/ScenarioModal.jsx';

export function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            CozyBench
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A comprehensive benchmarking platform for thermal comfort systems in smart spaces,
            combining Building Digital Twins, HVAC systems, and Occupant behavior analysis.
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Get Started
            </button>
            <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition">
              View Documentation
            </button>
          </div>
        </div>
      </div>
      <ScenarioModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}