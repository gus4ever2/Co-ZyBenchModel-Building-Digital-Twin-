import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';

function NavItemWithSubMenu({ text, icon, options }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {/* Main Nav Item */}
      <div
        onClick={toggleDropdown}
        className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg cursor-pointer"
      >
        {icon}
        <span>{text}</span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
          {options.map((option) => (
            <Link
              key={option.to}
              to={option.to}
              className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-start gap-2">
                {/* Option Icon */}
                {option.icon}

                {/* Option Label and Description */}
                <div>
                  <span className="text-gray-300 font-medium">{option.label}</span>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default NavItemWithSubMenu;