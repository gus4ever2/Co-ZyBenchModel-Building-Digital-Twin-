import React from 'react';
import { Building2, Thermometer, LineChart, Users } from 'lucide-react';

const features = [
  {
    icon: Building2,
    title: 'Digital Twin Integration',
    description: 'Simulate building environments with high-fidelity digital twins for accurate predictions.'
  },
  {
    icon: Thermometer,
    title: 'HVAC Optimization',
    description: 'Advanced algorithms to optimize HVAC systems for both comfort and energy efficiency.'
  },
  {
    icon: LineChart,
    title: 'Performance Metrics',
    description: 'Comprehensive analytics for energy consumption, thermal comfort, and system efficiency.'
  },
  {
    icon: Users,
    title: 'Occupant Comfort',
    description: 'Fair distribution of thermal comfort across all building occupants.'
  }
];

export function Features() {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
              <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}