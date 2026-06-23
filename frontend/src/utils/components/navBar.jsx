import React from 'react';
import logo from '../../assets/logo.png';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-900 shadow-md z-50">
      <div className="flex justify-between items-center px-8 py-6">
        {/* Logo Section */}
        <div className="flex items-center">
          <span className="text-4xl font-bold text-blue-500">
            Cozy<span className="text-blue-500">Bench</span>
          </span>
        </div>


        {/* Navigation Links */}
        <div className="hidden md:flex gap-6">
          <a href="#about-us" className="text-white hover:text-gray-600 transition duration-300">
            About us
          </a>
          <a href="#services" className="text-white hover:text-gray-600 transition duration-300">
            Services
          </a>
          <a href="#services" className="text-white hover:text-gray-600 transition duration-300">
            Documentation
          </a>
          <a href="#people-simulations" className="text-white hover:text-gray-600 transition duration-300">
            Explore Simulations
          </a>
        </div>


        {/* Create Account Button */}
        <div className="hidden md:block">
          <a
            href="/login"
            className="border border-white text-white px-4 py-2 rounded-md hover:bg-transparent hover:border-white transition duration-300 mr-4"
          >
            Login
          </a>
          <a
            href="/signup"
            className="border border-white text-white px-4 py-2 rounded-md hover:bg-transparent hover:border-white transition duration-300"
          >
            Create an account
          </a>
        </div>

        {/* Mobile Menu Icon */}
        <button className="block md:hidden text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
