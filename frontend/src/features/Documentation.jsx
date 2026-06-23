import React from 'react';
import { FileText, Code, BookOpen, Terminal } from 'lucide-react';

export default function Documentation() {
  return (
    <div className="p-8 ml-64">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Documentation</h1>
        <p className="text-gray-600 mt-2">Learn how to use CozyBench effectively</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <FileText className="w-8 h-8 text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
          <p className="text-gray-600 mb-4">
            Learn the basics of CozyBench and how to set up your first simulation.
          </p>
          <a href="#" className="text-blue-600 hover:underline">Read more →</a>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <Code className="w-8 h-8 text-green-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">API Reference</h2>
          <p className="text-gray-600 mb-4">
            Detailed documentation of our REST API endpoints and parameters.
          </p>
          <a href="#" className="text-blue-600 hover:underline">Read more →</a>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <BookOpen className="w-8 h-8 text-purple-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">User Guide</h2>
          <p className="text-gray-600 mb-4">
            Comprehensive guide to all features and functionalities.
          </p>
          <a href="#" className="text-blue-600 hover:underline">Read more →</a>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <Terminal className="w-8 h-8 text-red-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Examples</h2>
          <p className="text-gray-600 mb-4">
            Sample scenarios and use cases with detailed explanations.
          </p>
          <a href="#" className="text-blue-600 hover:underline">Read more →</a>
        </div>
      </div>
    </div>
  );
}