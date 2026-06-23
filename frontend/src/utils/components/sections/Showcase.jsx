import React from 'react';

export function Showcase() {
  return (
    <div className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Advanced Simulation Capabilities</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">1</div>
                <p className="ml-4 text-gray-600">Co-simulation approach combining building physics, HVAC systems, and occupant behavior</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">2</div>
                <p className="ml-4 text-gray-600">Customizable scenarios with different building configurations and climate conditions</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">3</div>
                <p className="ml-4 text-gray-600">Real-time visualization of simulation results and performance metrics</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80" 
              alt="Building automation system" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}