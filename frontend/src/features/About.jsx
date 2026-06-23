import React from 'react';
import { Thermometer, Award, Users, Globe } from 'lucide-react';

export default function About() {
  return (
    <div className="p-8 ml-64">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">About CozyBench</h1>
        <p className="text-gray-600 mt-2">Learn about our mission and technology</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-600">
            CozyBench is dedicated to optimizing thermal comfort in buildings while minimizing energy consumption. 
            Our platform enables engineers and building managers to simulate and benchmark HVAC systems for maximum efficiency.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Technology</h2>
          <p className="text-gray-600">
            We use advanced thermal modeling and machine learning algorithms to provide accurate simulations 
            and recommendations for building comfort optimization.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Key Features</h2>
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <Thermometer className="w-5 h-5 text-blue-600" />
              <span>Advanced thermal comfort simulation</span>
            </li>
            <li className="flex items-center gap-3">
              <Award className="w-5 h-5 text-green-600" />
              <span>Energy efficiency optimization</span>
            </li>
            <li className="flex items-center gap-3">
              <Users className="w-5 h-5 text-yellow-600" />
              <span>Occupant comfort analysis</span>
            </li>
            <li className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-purple-600" />
              <span>Global climate data integration</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
          <p className="text-gray-600 mb-4">
            Have questions about CozyBench? We'd love to hear from you.
          </p>
          <a 
            href="/contact" 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </div>
  );
}