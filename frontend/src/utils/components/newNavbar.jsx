import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Thermometer, LayoutDashboard, Building, Leaf, History, Info, FileText, Mail, ChartSpline, PlusCircle, Globe, Settings, LogOut} from 'lucide-react';
import NavItemWithSubMenu from '../components/NavItemWithDropDownMenu';

export default function Navbar() {
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to logout.');
      }
      console.log('Successfully logged out.');
  
      localStorage.removeItem('token'); // Remove the token from local storage
      console.log('Token removed from local storage.');
      console.log('Redirecting to login page...');
      console.log("localStorage:", localStorage);
      navigate('/login'); // Redirect to the login page
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  return (
    <nav className="fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white p-4">
      <Link to="/" className="flex items-center gap-3 mb-8 hover:text-blue-500 transition-colors">
        <Thermometer className="w-8 h-8 text-blue-400" />
        <span className="text-xl font-bold">CozyBench</span>
      </Link>

      
      <div className="space-y-2">
        <NavItem to="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} text="Dashboard" />
        <NavItem to="/simulation" icon={<ChartSpline  className="w-5 h-5" />} text="Current simulation" />
        <NavItem to="/buildingDT" icon={<Building  className="w-5 h-5" />} text="Create Building DT" />
        <NavItem to="/plantSimulation" icon={<Leaf  className="w-5 h-5" />} text="Create Plant DT" />
        <NavItemWithSubMenu
          text="New Simulation"
          icon={<PlusCircle className="w-5 h-5" />}
          options={[
            {
              to: '/configs',
              label: 'Reference Scenario',
              icon: <Globe className="w-4 h-4" />,
              description: 'Run a predefined reference scenario.',
            },
            {
              to: '/customized',
              label: 'Customized Scenario',
              icon: <Settings className="w-4 h-4" />,
              description: 'Create and run a custom scenario.',
            },
          ]}
        />
        <NavItem to="/history" icon={<History className="w-5 h-5" />} text="History" />
        <NavItem to="/about" icon={<Info className="w-5 h-5" />} text="About" />
        <NavItem to="/documentation" icon={<FileText className="w-5 h-5" />} text="Documentation" />
        <NavItem to="/contact" icon={<Mail className="w-5 h-5" />} text="Contact" />
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </button>
    </nav>
  );
}

function NavItem({ to, icon, text }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
}