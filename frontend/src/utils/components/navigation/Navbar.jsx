import React, { useState } from 'react';
import { Box, Route, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Navbar() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Box className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-semibold">CozyBench</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="https://www.computer.org/csdl/proceedings-article/percom-workshops/2024/10502756/1WnrIcXZjZC" className="text-gray-600 hover:text-gray-900">Documentation</a>
            <a href="https://github.com/satrai-lab/cozybench" className="text-gray-600 hover:text-gray-900">GitHub</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Contact</a>
            {/*<button 
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >

              Sign In
            </button>*/}

            <button 
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              LogIn
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}